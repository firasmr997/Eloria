package com.eloria.dto.settings;

import java.time.Instant;
import java.util.List;

public record SettingsDto(
        String centerName,
        String tagline,
        String addressLine,
        String postalCode,
        String city,
        String country,
        String phone,
        String email,
        List<HoursLine> openingHours,
        String instagramUrl,
        String facebookUrl,
        String pinterestUrl,
        String mapUrl,
        Instant updatedAt) {

    /** One row of the opening hours table, e.g. ("Monday – Friday", "9:00 – 20:00"). */
    public record HoursLine(String label, String hours) {
    }
}
