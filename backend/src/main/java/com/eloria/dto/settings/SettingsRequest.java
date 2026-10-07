package com.eloria.dto.settings;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SettingsRequest(
        @NotBlank @Size(max = 120) String centerName,
        @Size(max = 200) String tagline,
        @Size(max = 200) String addressLine,
        @Size(max = 20) String postalCode,
        @Size(max = 80) String city,
        @Size(max = 80) String country,
        @Pattern(regexp = "^$|^[+0-9][0-9 ().-]{6,24}$", message = "must be a valid phone number") String phone,
        @Email @Size(max = 255) String email,
        @Size(max = 10) List<@Valid HoursLineRequest> openingHours,
        @Size(max = 300) @Pattern(regexp = "^$|^https://.+", message = "must start with https://") String instagramUrl,
        @Size(max = 300) @Pattern(regexp = "^$|^https://.+", message = "must start with https://") String facebookUrl,
        @Size(max = 300) @Pattern(regexp = "^$|^https://.+", message = "must start with https://") String pinterestUrl,
        @Size(max = 600) @Pattern(regexp = "^$|^https://.+", message = "must start with https://") String mapUrl) {

    public record HoursLineRequest(
            @NotBlank @Size(max = 60) @Pattern(regexp = "^[^|\\r\\n]*$", message = "must not contain | or line breaks") String label,
            @NotBlank @Size(max = 60) @Pattern(regexp = "^[^|\\r\\n]*$", message = "must not contain | or line breaks") String hours) {
    }
}
