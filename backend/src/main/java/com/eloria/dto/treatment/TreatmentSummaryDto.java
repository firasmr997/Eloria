package com.eloria.dto.treatment;

import com.eloria.dto.category.CategoryRefDto;

import java.math.BigDecimal;
import java.time.Instant;

/** Card-sized view used by lists and search results. */
public record TreatmentSummaryDto(
        Long id,
        String name,
        String slug,
        String shortDescription,
        CategoryRefDto category,
        int durationMinutes,
        BigDecimal price,
        boolean priceFrom,
        String technology,
        String mainImageUrl,
        String mainImageAlt,
        boolean available,
        boolean featured,
        Instant updatedAt) {
}
