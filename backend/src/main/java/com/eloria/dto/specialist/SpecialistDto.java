package com.eloria.dto.specialist;

import java.time.Instant;
import java.util.List;

public record SpecialistDto(
        Long id,
        String name,
        String slug,
        String role,
        String bio,
        String photo,
        String experience,
        List<String> specialties,
        SocialLinks socialLinks,
        int displayOrder,
        Instant createdAt,
        Instant updatedAt) {

    public record SocialLinks(String instagram, String linkedin) {
    }
}
