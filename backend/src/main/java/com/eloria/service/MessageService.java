package com.eloria.service;

import com.eloria.config.RateLimitProperties;
import com.eloria.dto.common.PageResponse;
import com.eloria.dto.message.ContactMessageDto;
import com.eloria.dto.message.ContactRequest;
import com.eloria.dto.message.MessageUpdateRequest;
import com.eloria.entity.ContactMessage;
import com.eloria.entity.MessageStatus;
import com.eloria.exception.ResourceNotFoundException;
import com.eloria.mapper.ContactMessageMapper;
import com.eloria.repository.ContactMessageRepository;
import com.eloria.util.Text;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** The public contact form and the staff inbox behind it. */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final ContactMessageRepository repository;
    private final ContactMessageMapper mapper;
    private final RateLimiterService rateLimiter;
    private final RateLimitProperties rateLimits;

    @Transactional
    public void submit(ContactRequest request, String clientIp) {
        rateLimiter.check("contact:" + clientIp, rateLimits.publicSubmissions(), rateLimits.publicWindow(),
                "You have sent several messages in a short time. Please wait a few minutes or call us.");
        if (Text.clean(request.website()) != null) {
            log.info("Honeypot triggered on contact form from {}", clientIp);
            return;
        }
        ContactMessage message = new ContactMessage();
        message.setName(request.name().trim());
        message.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        message.setPhone(Text.clean(request.phone()));
        message.setMessage(request.message().trim());
        message.setStatus(MessageStatus.NEW);
        repository.save(message);
        log.info("Contact message #{} received", message.getId());
    }

    @Transactional(readOnly = true)
    /** @param inboxOnly when true and no status is given, excludes archived messages */
    public PageResponse<ContactMessageDto> list(MessageStatus status, boolean inboxOnly, String query, int page, int size) {
        String pattern = Text.likePattern(query);
        Specification<ContactMessage> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else if (inboxOnly) {
                predicates.add(cb.notEqual(root.get("status"), MessageStatus.ARCHIVED));
            }
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, '\\'),
                        cb.like(cb.lower(root.get("email")), pattern, '\\'),
                        cb.like(cb.lower(root.get("message")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        Sort sort = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
        return PageResponse.from(repository.findAll(spec, PageRequest.of(page, size, sort)), mapper::toDto);
    }

    @Transactional(readOnly = true)
    public ContactMessageDto get(Long id) {
        return mapper.toDto(find(id));
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return repository.countByStatus(MessageStatus.NEW);
    }

    @Transactional
    public ContactMessageDto update(Long id, MessageUpdateRequest request) {
        ContactMessage message = find(id);
        message.setStatus(request.status());
        return mapper.toDto(message);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(find(id));
        log.info("Contact message #{} deleted", id);
    }

    private ContactMessage find(Long id) {
        return repository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Message", id));
    }
}
