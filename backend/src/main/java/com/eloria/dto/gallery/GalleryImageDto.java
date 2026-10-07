package com.eloria.dto.gallery;

import com.eloria.entity.GalleryCategory;

import java.time.Instant;

public record GalleryImageDto(
        Long id,
        String title,
        String description,
        String imageUrl,
        GalleryCategory category,
        GalleryCategory.Collection collection,
        int displayOrder,
        boolean featured,
        Instant createdAt,
        Instant updatedAt) {
}
