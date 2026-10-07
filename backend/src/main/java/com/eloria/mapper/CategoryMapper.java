package com.eloria.mapper;

import com.eloria.dto.category.CategoryDto;
import com.eloria.dto.category.CategoryRefDto;
import com.eloria.dto.category.CategoryRequest;
import com.eloria.entity.TreatmentCategory;
import com.eloria.util.Text;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDto toDto(TreatmentCategory category, long treatmentCount) {
        return new CategoryDto(category.getId(), category.getName(), category.getSlug(), category.getDescription(),
                category.getDisplayOrder(), category.isActive(), treatmentCount,
                category.getCreatedAt(), category.getUpdatedAt());
    }

    public CategoryRefDto toRef(TreatmentCategory category) {
        return new CategoryRefDto(category.getId(), category.getName(), category.getSlug());
    }

    /** Copies request fields; the slug is handled by the service. */
    public void apply(CategoryRequest request, TreatmentCategory category) {
        category.setName(request.name().trim());
        category.setDescription(Text.clean(request.description()));
        category.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        category.setActive(request.active() == null || request.active());
    }
}
