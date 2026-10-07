package com.eloria.dto.category;

import java.time.Instant;

public record CategoryDto(
        Long id,
        String name,
        String slug,
        String description,
        int displayOrder,
        boolean active,
        long treatmentCount,
        Instant createdAt,
        Instant updatedAt) {
}
