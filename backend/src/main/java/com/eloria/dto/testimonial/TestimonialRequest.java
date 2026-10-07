package com.eloria.dto.testimonial;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TestimonialRequest(
        @NotBlank @Size(max = 120) String authorName,
        @Size(max = 160) String authorDetail,
        @NotBlank @Size(max = 1200) String quote,
        @Size(max = 120) String treatmentName,
        @Min(0) @Max(9999) Integer displayOrder,
        Boolean published) {
}
