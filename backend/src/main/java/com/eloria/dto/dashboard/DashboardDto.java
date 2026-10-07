package com.eloria.dto.dashboard;

import com.eloria.dto.appointment.AppointmentDto;
import com.eloria.dto.message.ContactMessageDto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record DashboardDto(
        long totalTreatments,
        long featuredTreatments,
        long availableTreatments,
        long galleryImages,
        long teamMembers,
        long results,
        long pendingAppointments,
        long unreadMessages,
        Map<String, Long> appointmentsByStatus,
        List<DayCount> requestsLast30Days,
        List<NamedCount> mostRequestedTreatments,
        List<AppointmentDto> recentAppointments,
        List<ContactMessageDto> recentMessages) {

    public record DayCount(LocalDate date, long count) {
    }

    public record NamedCount(String name, long count) {
    }
}
