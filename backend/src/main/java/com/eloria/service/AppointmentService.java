package com.eloria.service;

import com.eloria.config.RateLimitProperties;
import com.eloria.dto.appointment.AppointmentDto;
import com.eloria.dto.appointment.AppointmentReceiptDto;
import com.eloria.dto.appointment.AppointmentRequest;
import com.eloria.dto.appointment.AppointmentUpdateRequest;
import com.eloria.dto.common.PageResponse;
import com.eloria.entity.Appointment;
import com.eloria.entity.AppointmentStatus;
import com.eloria.entity.Treatment;
import com.eloria.exception.BadRequestException;
import com.eloria.exception.ResourceNotFoundException;
import com.eloria.mapper.AppointmentMapper;
import com.eloria.repository.AppointmentRepository;
import com.eloria.repository.TreatmentRepository;
import com.eloria.util.Text;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    /** The center is in Paris: "today" for booking rules is Paris time, whatever the server zone. */
    private static final ZoneId CENTER_ZONE = ZoneId.of("Europe/Paris");
    private static final int MAX_DAYS_AHEAD = 365;

    private final AppointmentRepository repository;
    private final TreatmentRepository treatmentRepository;
    private final AppointmentMapper mapper;
    private final RateLimiterService rateLimiter;
    private final RateLimitProperties rateLimits;
    private final Clock clock = Clock.systemUTC();

    /** Public booking form. Bots that fill the honeypot get a normal-looking answer and nothing is stored. */
    @Transactional
    public AppointmentReceiptDto request(AppointmentRequest request, String clientIp) {
        rateLimiter.check("appointment:" + clientIp, rateLimits.publicSubmissions(), rateLimits.publicWindow(),
                "You have sent several requests in a short time. Please wait a few minutes or call us.");
        LocalDate today = LocalDate.now(clock.withZone(CENTER_ZONE));
        if (request.preferredDate().isBefore(today)) {
            throw new BadRequestException("Please choose a date from today onwards");
        }
        if (request.preferredDate().isAfter(today.plusDays(MAX_DAYS_AHEAD))) {
            throw new BadRequestException("Requests can be made up to one year ahead");
        }
        Treatment treatment = null;
        if (request.treatmentId() != null) {
            treatment = treatmentRepository.findWithCategoryById(request.treatmentId())
                    .filter(t -> t.isAvailable() && t.getCategory().isActive())
                    .orElseThrow(() -> new BadRequestException("This treatment is not available for booking"));
        }
        if (Text.clean(request.website()) != null) {
            log.info("Honeypot triggered on booking form from {}", clientIp);
            return new AppointmentReceiptDto(null, request.name().trim(), treatment == null ? null : treatment.getName(),
                    request.preferredDate(), request.preferredTime());
        }

        Appointment appointment = new Appointment();
        appointment.setName(request.name().trim());
        appointment.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        appointment.setPhone(request.phone().trim());
        appointment.setTreatment(treatment);
        appointment.setTreatmentName(treatment == null ? null : treatment.getName());
        appointment.setPreferredDate(request.preferredDate());
        appointment.setPreferredTime(request.preferredTime());
        appointment.setMessage(Text.clean(request.message()));
        appointment.setStatus(AppointmentStatus.PENDING);
        repository.save(appointment);
        log.info("Appointment request #{} for {}", appointment.getId(), appointment.getTreatmentName());
        return mapper.toReceipt(appointment);
    }

    @Transactional(readOnly = true)
    public PageResponse<AppointmentDto> list(AppointmentStatus status, String query, LocalDate from, LocalDate to,
                                             int page, int size) {
        String pattern = Text.likePattern(query);
        Specification<Appointment> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("preferredDate"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("preferredDate"), to));
            }
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, '\\'),
                        cb.like(cb.lower(root.get("email")), pattern, '\\'),
                        cb.like(cb.lower(root.get("phone")), pattern, '\\'),
                        cb.like(cb.lower(root.get("treatmentName")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        Sort sort = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
        return PageResponse.from(repository.findAll(spec, PageRequest.of(page, size, sort)), mapper::toDto);
    }

    @Transactional(readOnly = true)
    public AppointmentDto get(Long id) {
        return mapper.toDto(find(id));
    }

    @Transactional
    public AppointmentDto update(Long id, AppointmentUpdateRequest request) {
        Appointment appointment = find(id);
        AppointmentStatus previous = appointment.getStatus();
        appointment.setStatus(request.status());
        appointment.setAdminNotes(Text.clean(request.adminNotes()));
        if (previous != request.status()) {
            log.info("Appointment #{}: {} -> {}", id, previous, request.status());
        }
        return mapper.toDto(appointment);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(find(id));
        log.info("Appointment #{} deleted", id);
    }

    private Appointment find(Long id) {
        return repository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Appointment", id));
    }
}
