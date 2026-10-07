package com.eloria.dto.result;

import com.eloria.validation.ImageUrl;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResultRequest(
        Long treatmentId,
        @NotBlank @ImageUrl @Size(max = 1000) String beforeImageUrl,
        @NotBlank @ImageUrl @Size(max = 1000) String afterImageUrl,
        @NotBlank @Size(max = 140) String title,
        @Size(max = 1200) String description,
        @Size(max = 120) String durationLabel,
        @Min(0) @Max(9999) Integer displayOrder,
        Boolean featured) {
}
