package com.eloria.service;

import com.eloria.dto.common.PageResponse;
import com.eloria.dto.treatment.TreatmentDto;
import com.eloria.dto.treatment.TreatmentOptionDto;
import com.eloria.dto.treatment.TreatmentRequest;
import com.eloria.dto.treatment.TreatmentSummaryDto;
import com.eloria.entity.Treatment;
import com.eloria.entity.TreatmentCategory;
import com.eloria.entity.TreatmentImage;
import com.eloria.exception.BadRequestException;
import com.eloria.exception.ResourceNotFoundException;
import com.eloria.mapper.TreatmentMapper;
import com.eloria.repository.TreatmentCategoryRepository;
import com.eloria.repository.TreatmentRepository;
import com.eloria.repository.spec.TreatmentSpecifications;
import com.eloria.repository.spec.TreatmentSpecifications.TreatmentFilter;
import com.eloria.security.CurrentUser;
import com.eloria.util.SlugUtils;
import com.eloria.util.Text;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class TreatmentService {

    private final TreatmentRepository treatmentRepository;
    private final TreatmentCategoryRepository categoryRepository;
    private final TreatmentMapper mapper;
    private final ImageReferenceService imageReferences;

    public record TreatmentSearch(String query, Long categoryId, String categorySlug, Boolean available,
                                  Boolean featured, TreatmentSort sort) {
    }

    public enum TreatmentSort {
        /** Featured first, then category order, then name. */
        CURATED(Sort.by(Sort.Order.desc("featured"), Sort.Order.asc("category.displayOrder"), Sort.Order.asc("name"))),
        NAME(Sort.by("name")),
        PRICE_ASC(Sort.by(Sort.Order.asc("price"), Sort.Order.asc("name"))),
        PRICE_DESC(Sort.by(Sort.Order.desc("price"), Sort.Order.asc("name"))),
        DURATION(Sort.by(Sort.Order.asc("durationMinutes"), Sort.Order.asc("name"))),
        NEWEST(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))),
        UPDATED(Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("id")));

        private final Sort sort;

        TreatmentSort(Sort sort) {
            this.sort = sort;
        }

        public Sort sort() {
            return sort.and(Sort.by("id"));
        }

        public static TreatmentSort parse(String value) {
            if (value == null || value.isBlank()) {
                return CURATED;
            }
            try {
                return valueOf(value.trim().replace('-', '_').toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Unknown sort '" + value + "'. Use curated, name, price-asc, price-desc, "
                        + "duration, newest or updated");
            }
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<TreatmentSummaryDto> search(TreatmentSearch search, int page, int size) {
        var filter = new TreatmentFilter(Text.clean(search.query()), search.categoryId(), Text.clean(search.categorySlug()),
                search.available(), search.featured(), CurrentUser.isStaff());
        var result = treatmentRepository.findAll(TreatmentSpecifications.filter(filter),
                PageRequest.of(page, size, search.sort().sort()));
        return PageResponse.from(result, mapper::toSummary);
    }

    @Transactional(readOnly = true)
    public TreatmentDto get(Long id) {
        return mapper.toDto(visible(treatmentRepository.findWithCategoryById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Treatment", id))));
    }

    @Transactional(readOnly = true)
    public TreatmentDto getBySlug(String slug) {
        return mapper.toDto(visible(treatmentRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment '" + slug + "' was not found"))));
    }

    /** Treatments a visitor can request (available, in an active category); staff get all of them. */
    @Transactional(readOnly = true)
    public List<TreatmentOptionDto> options() {
        return treatmentRepository.findOptions(CurrentUser.isStaff()).stream()
                .map(o -> new TreatmentOptionDto(o.getId(), o.getName(), o.getSlug(), o.getCategoryName()))
                .toList();
    }

    @Transactional
    public TreatmentDto create(TreatmentRequest request) {
        Treatment treatment = new Treatment();
        treatment.setCategory(category(request.categoryId()));
        mapper.apply(request, treatment);
        treatment.setSlug(SlugUtils.unique(treatment.getName(), treatmentRepository::existsBySlug));
        treatmentRepository.save(treatment);
        log.info("Treatment created: {}", treatment.getName());
        return mapper.toDto(treatment);
    }

    @Transactional
    public TreatmentDto update(Long id, TreatmentRequest request) {
        Treatment treatment = treatmentRepository.findWithCategoryById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Treatment", id));
        List<String> previousImages = imageUrls(treatment);
        boolean renamed = !treatment.getName().equalsIgnoreCase(request.name().trim());

        treatment.setCategory(category(request.categoryId()));
        mapper.apply(request, treatment);
        if (renamed) {
            treatment.setSlug(SlugUtils.unique(treatment.getName(), s -> treatmentRepository.existsBySlugAndIdNot(s, id)));
        }
        imageReferences.deleteUnreferencedAfterCommit(previousImages);
        return mapper.toDto(treatment);
    }

    @Transactional
    public void delete(Long id) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Treatment", id));
        List<String> images = imageUrls(treatment);
        treatmentRepository.delete(treatment);
        imageReferences.deleteUnreferencedAfterCommit(images);
        log.info("Treatment deleted: {}", treatment.getName());
    }

    private TreatmentCategory category(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Category " + id + " does not exist"));
    }

    /** Treatments in a hidden category are invisible to visitors. */
    private Treatment visible(Treatment treatment) {
        if (!treatment.getCategory().isActive() && !CurrentUser.isStaff()) {
            throw new ResourceNotFoundException("Treatment '" + treatment.getSlug() + "' was not found");
        }
        return treatment;
    }

    private static List<String> imageUrls(Treatment treatment) {
        List<String> urls = new ArrayList<>();
        urls.add(treatment.getMainImageUrl());
        treatment.getImages().stream().map(TreatmentImage::getImageUrl).forEach(urls::add);
        return urls;
    }
}
