package com.eloria.service;

import com.eloria.dto.category.CategoryDto;
import com.eloria.dto.category.CategoryRequest;
import com.eloria.entity.TreatmentCategory;
import com.eloria.exception.BadRequestException;
import com.eloria.exception.ConflictException;
import com.eloria.exception.ResourceNotFoundException;
import com.eloria.mapper.CategoryMapper;
import com.eloria.repository.TreatmentCategoryRepository;
import com.eloria.repository.TreatmentRepository;
import com.eloria.security.CurrentUser;
import com.eloria.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final TreatmentCategoryRepository categoryRepository;
    private final TreatmentRepository treatmentRepository;
    private final CategoryMapper mapper;

    /** Visitors only see active categories; staff may ask for all of them. */
    @Transactional(readOnly = true)
    public List<CategoryDto> list(boolean includeInactive) {
        Map<Long, Long> counts = treatmentRepository.countPerCategory().stream()
                .collect(Collectors.toMap(TreatmentRepository.CategoryCount::getCategoryId,
                        TreatmentRepository.CategoryCount::getTotal));
        List<TreatmentCategory> categories = includeInactive && CurrentUser.isStaff()
                ? categoryRepository.findAllByOrderByDisplayOrderAscIdAsc()
                : categoryRepository.findByActiveTrueOrderByDisplayOrderAscIdAsc();
        return categories.stream().map(c -> mapper.toDto(c, counts.getOrDefault(c.getId(), 0L))).toList();
    }

    @Transactional(readOnly = true)
    public CategoryDto get(Long id) {
        TreatmentCategory category = find(id);
        if (!category.isActive() && !CurrentUser.isStaff()) {
            throw ResourceNotFoundException.of("Category", id);
        }
        return mapper.toDto(category, treatmentRepository.countByCategoryId(id));
    }

    @Transactional
    public CategoryDto create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new ConflictException("A category named \"" + request.name().trim() + "\" already exists");
        }
        TreatmentCategory category = new TreatmentCategory();
        mapper.apply(request, category);
        category.setSlug(SlugUtils.unique(category.getName(), categoryRepository::existsBySlug));
        categoryRepository.save(category);
        log.info("Category created: {}", category.getName());
        return mapper.toDto(category, 0);
    }

    @Transactional
    public CategoryDto update(Long id, CategoryRequest request) {
        TreatmentCategory category = find(id);
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.name().trim(), id)) {
            throw new ConflictException("A category named \"" + request.name().trim() + "\" already exists");
        }
        boolean renamed = !category.getName().equalsIgnoreCase(request.name().trim());
        mapper.apply(request, category);
        if (renamed) {
            category.setSlug(SlugUtils.unique(category.getName(), s -> categoryRepository.existsBySlugAndIdNot(s, id)));
        }
        return mapper.toDto(category, treatmentRepository.countByCategoryId(id));
    }

    /**
     * Deletes a category. When treatments still belong to it, {@code reassignTo} must name another category to
     * move them to first; otherwise the request is refused with 409 so nothing is lost silently.
     */
    @Transactional
    public void delete(Long id, Long reassignTo) {
        TreatmentCategory category = find(id);
        long treatments = treatmentRepository.countByCategoryId(id);
        if (treatments > 0) {
            if (reassignTo == null) {
                throw new ConflictException("\"" + category.getName() + "\" still has " + treatments
                        + (treatments == 1 ? " treatment" : " treatments")
                        + ". Move them to another category before deleting it.");
            }
            if (reassignTo.equals(id)) {
                throw new BadRequestException("Choose a different category to move the treatments to");
            }
            TreatmentCategory target = find(reassignTo);
            int moved = treatmentRepository.reassignCategory(category, target);
            log.info("Moved {} treatments from {} to {}", moved, category.getName(), target.getName());
        }
        categoryRepository.delete(category);
        log.info("Category deleted: {}", category.getName());
    }

    private TreatmentCategory find(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Category", id));
    }
}
