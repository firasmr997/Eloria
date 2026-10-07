package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.common.PageResponse;
import com.eloria.dto.gallery.GalleryImageDto;
import com.eloria.dto.gallery.GalleryImageRequest;
import com.eloria.entity.GalleryCategory;
import com.eloria.service.GalleryService;
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

@Tag(name = "Gallery")
@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @Operation(summary = "List gallery photos",
            description = "`collection=EDITORIAL` for the main gallery, `collection=CENTER` for the premises; "
                    + "`category` narrows to one category.")
    @GetMapping
    public ApiResponse<PageResponse<GalleryImageDto>> list(
            @RequestParam(required = false) GalleryCategory.Collection collection,
            @RequestParam(required = false) GalleryCategory category,
            @RequestParam(required = false) Boolean featured,
            @Parameter(description = "Search title and description") @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size) {
        Paging.check(page, size);
        return ApiResponse.ok(galleryService.list(collection, category, featured, q, page, size));
    }

    @Operation(summary = "Get a gallery photo")
    @GetMapping("/{id}")
    public ApiResponse<GalleryImageDto> get(@PathVariable Long id) {
        return ApiResponse.ok(galleryService.get(id));
    }

    @Operation(summary = "Add a gallery photo",
            description = "Upload the file first with POST /api/uploads?folder=gallery, then send its url here.",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<GalleryImageDto> create(@Valid @RequestBody GalleryImageRequest request) {
        return ApiResponse.ok(galleryService.create(request), "Photo added");
    }

    @Operation(summary = "Update or replace a gallery photo",
            description = "Sending a different imageUrl replaces the photo; the previous upload is deleted.",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping("/{id}")
    public ApiResponse<GalleryImageDto> update(@PathVariable Long id, @Valid @RequestBody GalleryImageRequest request) {
        return ApiResponse.ok(galleryService.update(id, request), "Photo updated");
    }

    @Operation(summary = "Delete a gallery photo", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        galleryService.delete(id);
        return ApiResponse.message("Photo deleted");
    }
}
