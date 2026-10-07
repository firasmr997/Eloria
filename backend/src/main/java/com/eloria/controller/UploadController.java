package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.upload.UploadResponse;
import com.eloria.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Uploads")
@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class UploadController {

    private final UploadService uploadService;

    @Operation(summary = "Upload an image",
            description = "JPG, PNG, WebP or AVIF up to the configured size (8 MB by default). Type, extension and "
                    + "file content must agree. Returns the public `url` to store on the treatment, photo, result or specialist.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @Parameter(description = "treatments, gallery, results or team") @RequestParam String folder) {
        return ApiResponse.ok(uploadService.upload(file, folder), "Image uploaded");
    }

    @Operation(summary = "Delete an unused upload",
            description = "For uploads never saved on any content (e.g. a cancelled form). Refused with 409 when in use.")
    @DeleteMapping
    public ApiResponse<Void> deleteUnused(@RequestParam String url) {
        uploadService.deleteUnused(url);
        return ApiResponse.message("Image deleted");
    }
}
