package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.settings.SettingsDto;
import com.eloria.dto.settings.SettingsRequest;
import com.eloria.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Settings")
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @Operation(summary = "Center profile", description = "Address, contact channels and opening hours shown on the site.")
    @GetMapping
    public ApiResponse<SettingsDto> get() {
        return ApiResponse.ok(settingsService.get());
    }

    @Operation(summary = "Update the center profile (ADMIN)", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping
    public ApiResponse<SettingsDto> update(@Valid @RequestBody SettingsRequest request) {
        return ApiResponse.ok(settingsService.update(request), "Settings saved");
    }
}
