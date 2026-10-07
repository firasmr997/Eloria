package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.category.CategoryDto;
import com.eloria.dto.category.CategoryRequest;
import com.eloria.dto.common.ApiResponse;
import com.eloria.service.CategoryService;
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

@Tag(name = "Categories")
@RestController
@RequestMapping("/api/treatment-categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "List treatment categories",
            description = "Active categories in display order, each with its treatment count. "
                    + "Staff may pass `all=true` to include hidden categories.")
    @GetMapping
    public ApiResponse<List<CategoryDto>> list(
            @Parameter(description = "Staff only: include inactive categories") @RequestParam(defaultValue = "false") boolean all) {
        return ApiResponse.ok(categoryService.list(all));
    }

    @Operation(summary = "Get a category")
    @GetMapping("/{id}")
    public ApiResponse<CategoryDto> get(@PathVariable Long id) {
        return ApiResponse.ok(categoryService.get(id));
    }

    @Operation(summary = "Create a category", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryDto> create(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok(categoryService.create(request), "Category created");
    }

    @Operation(summary = "Update a category", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping("/{id}")
    public ApiResponse<CategoryDto> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok(categoryService.update(id, request), "Category updated");
    }

    @Operation(summary = "Delete a category",
            description = "Refused with 409 while treatments belong to it, unless `reassignTo` names the category "
                    + "to move them to first.",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id,
                                    @Parameter(description = "Category receiving this category's treatments")
                                    @RequestParam(required = false) Long reassignTo) {
        categoryService.delete(id, reassignTo);
        return ApiResponse.message("Category deleted");
    }
}
