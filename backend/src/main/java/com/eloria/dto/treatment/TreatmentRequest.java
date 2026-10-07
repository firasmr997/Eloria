package com.eloria.dto.treatment;

import com.eloria.validation.ImageUrl;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record TreatmentRequest(
        @NotBlank @Size(max = 120) String name,
        @NotNull Long categoryId,
        @NotBlank @Size(max = 280) String shortDescription,
        @NotBlank @Size(max = 6000) String description,
        @NotNull @Min(5) @Max(600) Integer durationMinutes,
        @Size(max = 120) String sessions,
        @Size(max = 120) String downtime,
        @NotNull @DecimalMin("0.00") @DecimalMax("99999.99") @Digits(integer = 5, fraction = 2) BigDecimal price,
        Boolean priceFrom,
        @Size(max = 20) List<@NotBlank @Size(max = 300) String> benefits,
        @Size(max = 20) List<@NotBlank @Size(max = 300) String> preparation,
        @Size(max = 20) List<@NotBlank @Size(max = 300) String> aftercare,
        @Size(max = 20) List<@NotBlank @Size(max = 300) String> contraindications,
        @Size(max = 200) String technology,
        @ImageUrl @Size(max = 1000) String mainImageUrl,
        @Size(max = 240) String mainImageAlt,
        @Size(max = 12) List<@Valid ImageRequest> additionalImages,
        @Size(max = 12) List<@Valid FaqRequest> faqs,
        Boolean available,
        Boolean featured) {

    public record ImageRequest(
            @NotBlank @ImageUrl @Size(max = 1000) String imageUrl,
            @Size(max = 240) String altText) {
    }

    public record FaqRequest(
            @NotBlank @Size(max = 300) String question,
            @NotBlank @Size(max = 3000) String answer) {
    }
}
