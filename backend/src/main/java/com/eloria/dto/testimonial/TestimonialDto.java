package com.eloria.dto.testimonial;

import java.time.Instant;

public record TestimonialDto(
        Long id,
        String authorName,
        String authorDetail,
        String quote,
        String treatmentName,
        int displayOrder,
        boolean published,
        Instant createdAt,
        Instant updatedAt) {
}
