package com.eloria.dto.appointment;

import com.eloria.dto.treatment.TreatmentRefDto;
import com.eloria.entity.AppointmentStatus;

import java.time.Instant;
import java.time.LocalDate;

public record AppointmentDto(
        Long id,
        String name,
        String email,
        String phone,
        TreatmentRefDto treatment,
        String treatmentName,
        LocalDate preferredDate,
        String preferredTime,
        String message,
        AppointmentStatus status,
        String adminNotes,
        Instant createdAt,
        Instant updatedAt) {
}
