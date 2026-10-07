package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.testimonial.TestimonialDto;
import com.eloria.dto.testimonial.TestimonialRequest;
import com.eloria.service.TestimonialService;
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

import java.util.List;

@Tag(name = "Testimonials")
@RestController
@RequestMapping("/api/testimonials")
@RequiredArgsConstructor
public class TestimonialController {

    private final TestimonialService testimonialService;

    @Operation(summary = "List testimonials", description = "Published ones; staff may pass `all=true`.")
    @GetMapping
    public ApiResponse<List<TestimonialDto>> list(@RequestParam(defaultValue = "false") boolean all) {
        return ApiResponse.ok(testimonialService.list(all));
    }

    @Operation(summary = "Add a testimonial", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TestimonialDto> create(@Valid @RequestBody TestimonialRequest request) {
        return ApiResponse.ok(testimonialService.create(request), "Testimonial added");
    }

    @Operation(summary = "Update a testimonial", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping("/{id}")
    public ApiResponse<TestimonialDto> update(@PathVariable Long id, @Valid @RequestBody TestimonialRequest request) {
        return ApiResponse.ok(testimonialService.update(id, request), "Testimonial updated");
    }

    @Operation(summary = "Delete a testimonial", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        testimonialService.delete(id);
        return ApiResponse.message("Testimonial deleted");
    }
}
