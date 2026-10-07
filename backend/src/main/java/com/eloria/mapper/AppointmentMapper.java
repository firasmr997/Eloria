package com.eloria.mapper;

import com.eloria.dto.appointment.AppointmentDto;
import com.eloria.dto.appointment.AppointmentReceiptDto;
import com.eloria.entity.Appointment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AppointmentMapper {

    private final TreatmentMapper treatmentMapper;

    public AppointmentDto toDto(Appointment a) {
        return new AppointmentDto(a.getId(), a.getName(), a.getEmail(), a.getPhone(),
                treatmentMapper.toRef(a.getTreatment()), a.getTreatmentName(), a.getPreferredDate(),
                a.getPreferredTime(), a.getMessage(), a.getStatus(), a.getAdminNotes(), a.getCreatedAt(), a.getUpdatedAt());
    }

    public AppointmentReceiptDto toReceipt(Appointment a) {
        return new AppointmentReceiptDto(a.getId(), a.getName(), a.getTreatmentName(), a.getPreferredDate(), a.getPreferredTime());
    }
}
