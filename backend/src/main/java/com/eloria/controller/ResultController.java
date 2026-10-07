package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.common.PageResponse;
import com.eloria.dto.result.ResultDto;
import com.eloria.dto.result.ResultRequest;
import com.eloria.service.ResultService;
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

@Tag(name = "Results")
@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @Operation(summary = "List before / after results", description = "Optionally filtered by treatment.")
    @GetMapping
    public ApiResponse<PageResponse<ResultDto>> list(
            @RequestParam(required = false) Long treatmentId,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Paging.check(page, size);
        return ApiResponse.ok(resultService.list(treatmentId, featured, page, size));
    }

    @Operation(summary = "Get a result")
    @GetMapping("/{id}")
    public ApiResponse<ResultDto> get(@PathVariable Long id) {
        return ApiResponse.ok(resultService.get(id));
    }

    @Operation(summary = "Create a result", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ResultDto> create(@Valid @RequestBody ResultRequest request) {
        return ApiResponse.ok(resultService.create(request), "Result created");
    }

    @Operation(summary = "Update a result", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping("/{id}")
    public ApiResponse<ResultDto> update(@PathVariable Long id, @Valid @RequestBody ResultRequest request) {
        return ApiResponse.ok(resultService.update(id, request), "Result updated");
    }

    @Operation(summary = "Delete a result", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        resultService.delete(id);
        return ApiResponse.message("Result deleted");
    }
}
