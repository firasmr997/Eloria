package com.eloria.dto.appointment;

import com.eloria.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Staff update: the status and the internal notes. */
public record AppointmentUpdateRequest(
        @NotNull AppointmentStatus status,
        @Size(max = 2000) String adminNotes) {
}
