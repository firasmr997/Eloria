package com.eloria.dto.specialist;

import com.eloria.validation.ImageUrl;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SpecialistRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 140) String role,
        @NotBlank @Size(max = 4000) String bio,
        @ImageUrl @Size(max = 1000) String photo,
        @Size(max = 80) String experience,
        @Size(max = 12) List<@NotBlank @Size(max = 120) String> specialties,
        @Size(max = 300) @Pattern(regexp = "^$|^https://.+", message = "must start with https://") String instagramUrl,
        @Size(max = 300) @Pattern(regexp = "^$|^https://.+", message = "must start with https://") String linkedinUrl,
        @Min(0) @Max(9999) Integer displayOrder) {
}
