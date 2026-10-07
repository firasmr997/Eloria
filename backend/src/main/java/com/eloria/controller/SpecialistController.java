package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.common.PageResponse;
import com.eloria.dto.specialist.SpecialistDto;
import com.eloria.dto.specialist.SpecialistRequest;
import com.eloria.service.SpecialistService;
import com.eloria.util.Paging;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

@Tag(name = "Specialists")
@RestController
@RequestMapping("/api/specialists")
@RequiredArgsConstructor
public class SpecialistController {

    private final SpecialistService specialistService;

    @Operation(summary = "List the team", description = "In display order; `q` matches name, role and specialties.")
    @GetMapping
    public ApiResponse<PageResponse<SpecialistDto>> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size) {
        Paging.check(page, size);
        return ApiResponse.ok(specialistService.list(q, page, size));
    }

    @Operation(summary = "Get a specialist by id or slug")
    @GetMapping("/{idOrSlug}")
    public ApiResponse<SpecialistDto> get(@PathVariable String idOrSlug) {
        return ApiResponse.ok(specialistService.get(idOrSlug));
    }

    @Operation(summary = "Add a specialist", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SpecialistDto> create(@Valid @RequestBody SpecialistRequest request) {
        return ApiResponse.ok(specialistService.create(request), "Specialist added");
    }

    @Operation(summary = "Update a specialist", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping("/{id}")
    public ApiResponse<SpecialistDto> update(@PathVariable Long id, @Valid @RequestBody SpecialistRequest request) {
        return ApiResponse.ok(specialistService.update(id, request), "Specialist updated");
    }

    @Operation(summary = "Delete a specialist", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        specialistService.delete(id);
        return ApiResponse.message("Specialist deleted");
    }
}
