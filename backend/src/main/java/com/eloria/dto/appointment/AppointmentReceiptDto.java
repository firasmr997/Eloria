package com.eloria.dto.appointment;

import java.time.LocalDate;

/** What the public form gets back: enough to confirm the request, nothing staff-only. */
public record AppointmentReceiptDto(Long id, String name, String treatmentName, LocalDate preferredDate, String preferredTime) {
}
