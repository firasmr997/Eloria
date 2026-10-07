package com.eloria.dto.message;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * @param website honeypot field: real visitors never see or fill it
 */
public record ContactRequest(
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @Pattern(regexp = "^$|^[+0-9][0-9 ().-]{6,24}$", message = "must be a valid phone number") String phone,
        @NotBlank @Size(min = 10, max = 4000) String message,
        @Size(max = 200) String website) {
}
