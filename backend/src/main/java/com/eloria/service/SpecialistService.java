package com.eloria.service;

import com.eloria.dto.common.PageResponse;
import com.eloria.dto.specialist.SpecialistDto;
import com.eloria.dto.specialist.SpecialistRequest;
import com.eloria.entity.Specialist;
import com.eloria.exception.ResourceNotFoundException;
import com.eloria.mapper.SpecialistMapper;
import com.eloria.repository.SpecialistRepository;
import com.eloria.util.SlugUtils;
import com.eloria.util.Text;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpecialistService {

    private static final Sort ORDER = Sort.by(Sort.Order.asc("displayOrder"), Sort.Order.asc("id"));

    private final SpecialistRepository repository;
    private final SpecialistMapper mapper;
    private final ImageReferenceService imageReferences;

    @Transactional(readOnly = true)
    public PageResponse<SpecialistDto> list(String query, int page, int size) {
        String pattern = Text.likePattern(query);
        Specification<Specialist> spec = (root, q, cb) -> pattern == null ? cb.conjunction() : cb.or(
                cb.like(cb.lower(root.get("name")), pattern, '\\'),
                cb.like(cb.lower(root.get("role")), pattern, '\\'),
                cb.like(cb.lower(root.get("specialties")), pattern, '\\'));
        return PageResponse.from(repository.findAll(spec, PageRequest.of(page, size, ORDER)), mapper::toDto);
    }

    /** Accepts a numeric id or a slug, so profile URLs can stay readable. */
    @Transactional(readOnly = true)
    public SpecialistDto get(String idOrSlug) {
        Specialist specialist = idOrSlug.chars().allMatch(Character::isDigit)
                ? repository.findById(Long.parseLong(idOrSlug)).orElse(null)
                : repository.findBySlug(idOrSlug).orElse(null);
        if (specialist == null) {
            throw new ResourceNotFoundException("Specialist '" + idOrSlug + "' was not found");
        }
        return mapper.toDto(specialist);
    }

    @Transactional
    public SpecialistDto create(SpecialistRequest request) {
        Specialist specialist = new Specialist();
        mapper.apply(request, specialist);
        specialist.setSlug(SlugUtils.unique(specialist.getName(), repository::existsBySlug));
        repository.save(specialist);
        log.info("Specialist created: {}", specialist.getName());
        return mapper.toDto(specialist);
    }

    @Transactional
    public SpecialistDto update(Long id, SpecialistRequest request) {
        Specialist specialist = find(id);
        String previousPhoto = specialist.getPhoto();
        boolean renamed = !specialist.getName().equalsIgnoreCase(request.name().trim());
        mapper.apply(request, specialist);
        if (renamed) {
            specialist.setSlug(SlugUtils.unique(specialist.getName(), s -> repository.existsBySlugAndIdNot(s, id)));
        }
        if (previousPhoto != null && !previousPhoto.equals(specialist.getPhoto())) {
            imageReferences.deleteUnreferencedAfterCommit(List.of(previousPhoto));
        }
        return mapper.toDto(specialist);
    }

    @Transactional
    public void delete(Long id) {
        Specialist specialist = find(id);
        repository.delete(specialist);
        if (specialist.getPhoto() != null) {
            imageReferences.deleteUnreferencedAfterCommit(List.of(specialist.getPhoto()));
        }
        log.info("Specialist deleted: {}", specialist.getName());
    }

    private Specialist find(Long id) {
        return repository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Specialist", id));
    }
}
