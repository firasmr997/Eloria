package com.eloria.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** An absolute http(s) URL or a site-relative path such as {@code /uploads/gallery/x.webp}. Null is allowed. */
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT, ElementType.TYPE_USE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ImageUrlValidator.class)
public @interface ImageUrl {

    String message() default "must be an http(s) URL or a /uploads path";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
