package com.eloria.dto.gallery;

import com.eloria.entity.GalleryCategory;
import com.eloria.validation.ImageUrl;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GalleryImageRequest(
        @NotBlank @Size(max = 140) String title,
        @Size(max = 600) String description,
        @NotBlank @ImageUrl @Size(max = 1000) String imageUrl,
        @NotNull GalleryCategory category,
        @Min(0) @Max(9999) Integer displayOrder,
        Boolean featured) {
}
