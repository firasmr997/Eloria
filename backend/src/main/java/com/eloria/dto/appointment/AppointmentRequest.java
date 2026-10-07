package com.eloria.dto.appointment;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * A consultation request from the public booking form.
 *
 * @param website honeypot field: real visitors never see or fill it
 */
public record AppointmentRequest(
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank
        @Pattern(regexp = "^[+0-9][0-9 ().-]{6,24}$", message = "must be a valid phone number")
        String phone,
        Long treatmentId,
        @NotNull @FutureOrPresent LocalDate preferredDate,
        @NotBlank
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "must be a time such as 10:30")
        String preferredTime,
        @Size(max = 2000) String message,
        @Size(max = 200) String website) {
}
