package com.eloria.dto.common;

import java.util.List;

/**
 * Error envelope: {@code {"success": false, "message": "...", "errors": [{"field": "...", "message": "..."}]}}.
 */
public record ApiErrorResponse(boolean success, String message, List<FieldError> errors) {

    public record FieldError(String field, String message) {
    }

    public static ApiErrorResponse of(String message) {
        return new ApiErrorResponse(false, message, List.of());
    }

    public static ApiErrorResponse of(String message, List<FieldError> errors) {
        return new ApiErrorResponse(false, message, errors);
    }
}
