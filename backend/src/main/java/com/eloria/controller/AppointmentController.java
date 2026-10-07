package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.appointment.AppointmentDto;
import com.eloria.dto.appointment.AppointmentReceiptDto;
import com.eloria.dto.appointment.AppointmentRequest;
import com.eloria.dto.appointment.AppointmentUpdateRequest;
import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.common.PageResponse;
import com.eloria.entity.AppointmentStatus;
import com.eloria.service.AppointmentService;
import com.eloria.util.Paging;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name = "Appointments")
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @Operation(summary = "Request a consultation",
            description = "Public booking form. Creates a PENDING request that staff confirm by phone or email. "
                    + "Rate limited per address (HTTP 429).")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AppointmentReceiptDto> request(@Valid @RequestBody AppointmentRequest request, HttpServletRequest http) {
        return ApiResponse.ok(appointmentService.request(request, http.getRemoteAddr()),
                "Thank you. Your request has been received and our team will contact you to confirm.");
    }

    @Operation(summary = "List appointment requests", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @GetMapping
    public ApiResponse<PageResponse<AppointmentDto>> list(
            @RequestParam(required = false) AppointmentStatus status,
            @Parameter(description = "Search name, email, phone or treatment") @RequestParam(required = false) String q,
            @Parameter(description = "Preferred date from (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Preferred date to (inclusive)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Paging.check(page, size);
        return ApiResponse.ok(appointmentService.list(status, q, from, to, page, size));
    }

    @Operation(summary = "Get an appointment request", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @GetMapping("/{id}")
    public ApiResponse<AppointmentDto> get(@PathVariable Long id) {
        return ApiResponse.ok(appointmentService.get(id));
    }

    @Operation(summary = "Update status and notes", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping("/{id}")
    public ApiResponse<AppointmentDto> update(@PathVariable Long id, @Valid @RequestBody AppointmentUpdateRequest request) {
        return ApiResponse.ok(appointmentService.update(id, request), "Appointment updated");
    }

    @Operation(summary = "Delete an appointment request", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        appointmentService.delete(id);
        return ApiResponse.message("Appointment deleted");
    }
}
