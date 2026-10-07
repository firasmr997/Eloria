package com.eloria.service;

import com.eloria.dto.dashboard.DashboardDto;
import com.eloria.entity.AppointmentStatus;
import com.eloria.entity.MessageStatus;
import com.eloria.mapper.AppointmentMapper;
import com.eloria.mapper.ContactMessageMapper;
import com.eloria.repository.AppointmentRepository;
import com.eloria.repository.ContactMessageRepository;
import com.eloria.repository.GalleryImageRepository;
import com.eloria.repository.ResultRepository;
import com.eloria.repository.SpecialistRepository;
import com.eloria.repository.TreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final ZoneId CENTER_ZONE = ZoneId.of("Europe/Paris");
    private static final int TREND_DAYS = 30;

    private final TreatmentRepository treatmentRepository;
    private final GalleryImageRepository galleryRepository;
    private final SpecialistRepository specialistRepository;
    private final ResultRepository resultRepository;
    private final AppointmentRepository appointmentRepository;
    private final ContactMessageRepository messageRepository;
    private final AppointmentMapper appointmentMapper;
    private final ContactMessageMapper messageMapper;
    private final Clock clock = Clock.systemUTC();

    @Transactional(readOnly = true)
    public DashboardDto overview() {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (AppointmentStatus status : AppointmentStatus.values()) {
            byStatus.put(status.name(), appointmentRepository.countByStatus(status));
        }

        LocalDate today = LocalDate.now(clock.withZone(CENTER_ZONE));
        LocalDate firstDay = today.minusDays(TREND_DAYS - 1L);
        Instant since = firstDay.atStartOfDay(CENTER_ZONE).toInstant();
        Map<LocalDate, Long> perDay = appointmentRepository.findCreatedSince(since).stream()
                .collect(Collectors.groupingBy(i -> LocalDate.ofInstant(i, CENTER_ZONE), Collectors.counting()));
        List<DashboardDto.DayCount> trend = new ArrayList<>();
        for (LocalDate day = firstDay; !day.isAfter(today); day = day.plusDays(1)) {
            trend.add(new DashboardDto.DayCount(day, perDay.getOrDefault(day, 0L)));
        }

        var top = appointmentRepository.countByTreatmentName(PageRequest.of(0, 5)).stream()
                .map(c -> new DashboardDto.NamedCount(c.getName(), c.getTotal()))
                .toList();
        var recentAppointments = appointmentRepository.findAll(
                        PageRequest.of(0, 6, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))))
                .map(appointmentMapper::toDto).getContent();
        var recentMessages = messageRepository.findAll(
                        PageRequest.of(0, 5, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))))
                .map(messageMapper::toDto).getContent();

        return new DashboardDto(
                treatmentRepository.count(),
                treatmentRepository.countByFeaturedTrue(),
                treatmentRepository.countByAvailableTrue(),
                galleryRepository.count(),
                specialistRepository.count(),
                resultRepository.count(),
                byStatus.get(AppointmentStatus.PENDING.name()),
                messageRepository.countByStatus(MessageStatus.NEW),
                byStatus,
                trend,
                top,
                recentAppointments,
                recentMessages);
    }
}
