package com.eloria.dto.result;

import com.eloria.dto.treatment.TreatmentRefDto;

import java.time.Instant;

public record ResultDto(
        Long id,
        TreatmentRefDto treatment,
        String beforeImageUrl,
        String afterImageUrl,
        String title,
        String description,
        String durationLabel,
        boolean featured,
        int displayOrder,
        Instant createdAt,
        Instant updatedAt) {
}
