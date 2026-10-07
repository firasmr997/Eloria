package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.common.PageResponse;
import com.eloria.dto.treatment.TreatmentDto;
import com.eloria.dto.treatment.TreatmentOptionDto;
import com.eloria.dto.treatment.TreatmentRequest;
import com.eloria.dto.treatment.TreatmentSummaryDto;
import com.eloria.service.TreatmentService;
import com.eloria.service.TreatmentService.TreatmentSearch;
import com.eloria.service.TreatmentService.TreatmentSort;
import com.eloria.util.Paging;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

import java.util.List;

@Tag(name = "Treatments")
@RestController
@RequestMapping("/api/treatments")
@RequiredArgsConstructor
public class TreatmentController {

    private final TreatmentService treatmentService;

    @Operation(summary = "Search treatments",
            description = "Paginated catalogue. `q` matches name, descriptions, technology and category. "
                    + "Visitors never receive treatments from hidden categories.")
    @GetMapping
    public ApiResponse<PageResponse<TreatmentSummaryDto>> search(
            @Parameter(description = "Free-text search") @RequestParam(required = false) String q,
            @Parameter(description = "Category id") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Category slug, e.g. `facial`") @RequestParam(required = false) String category,
            @Parameter(description = "Only available (true) or unavailable (false)") @RequestParam(required = false) Boolean available,
            @Parameter(description = "Only featured treatments") @RequestParam(required = false) Boolean featured,
            @Parameter(description = "curated (default), name, price-asc, price-desc, duration, newest, updated")
            @RequestParam(required = false) String sort,
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (1-100)") @RequestParam(defaultValue = "12") int size) {
        Paging.check(page, size);
        var search = new TreatmentSearch(q, categoryId, category, available, featured, TreatmentSort.parse(sort));
        return ApiResponse.ok(treatmentService.search(search, page, size));
    }

    @Operation(summary = "Treatment options for select boxes",
            description = "Bookable treatments (available, in an active category) as id/name pairs.")
    @GetMapping("/options")
    public ApiResponse<List<TreatmentOptionDto>> options() {
        return ApiResponse.ok(treatmentService.options());
    }

    @Operation(summary = "Get a treatment by id")
    @GetMapping("/{id:\\d+}")
    public ApiResponse<TreatmentDto> get(@PathVariable Long id) {
        return ApiResponse.ok(treatmentService.get(id));
    }

    @Operation(summary = "Get a treatment by slug")
    @GetMapping("/slug/{slug}")
    public ApiResponse<TreatmentDto> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(treatmentService.getBySlug(slug));
    }

    @Operation(summary = "Create a treatment", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TreatmentDto> create(@Valid @RequestBody TreatmentRequest request) {
        return ApiResponse.ok(treatmentService.create(request), "Treatment created");
    }

    @Operation(summary = "Update a treatment",
            description = "Full update. Additional images missing from the request are removed and their uploads deleted.",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping("/{id}")
    public ApiResponse<TreatmentDto> update(@PathVariable Long id, @Valid @RequestBody TreatmentRequest request) {
        return ApiResponse.ok(treatmentService.update(id, request), "Treatment updated");
    }

    @Operation(summary = "Delete a treatment",
            description = "Its before/after results stay, unlinked; past appointment requests keep the treatment name.",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        treatmentService.delete(id);
        return ApiResponse.message("Treatment deleted");
    }
}
