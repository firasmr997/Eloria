package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.dashboard.DashboardDto;
import com.eloria.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Admin overview", description = "Counts, the 30-day request trend and the latest activity.",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @GetMapping
    public ApiResponse<DashboardDto> overview() {
        return ApiResponse.ok(dashboardService.overview());
    }
}
