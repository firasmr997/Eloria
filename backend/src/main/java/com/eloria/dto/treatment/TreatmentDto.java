package com.eloria.dto.treatment;

import com.eloria.dto.category.CategoryRefDto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record TreatmentDto(
        Long id,
        String name,
        String slug,
        String shortDescription,
        String description,
        CategoryRefDto category,
        int durationMinutes,
        String sessions,
        String downtime,
        BigDecimal price,
        boolean priceFrom,
        List<String> benefits,
        List<String> preparation,
        List<String> aftercare,
        List<String> contraindications,
        String technology,
        String mainImageUrl,
        String mainImageAlt,
        List<ImageDto> additionalImages,
        List<FaqDto> faqs,
        boolean available,
        boolean featured,
        Instant createdAt,
        Instant updatedAt) {

    public record ImageDto(Long id, String imageUrl, String altText) {
    }

    public record FaqDto(Long id, String question, String answer) {
    }
}
