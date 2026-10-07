package com.eloria.exception;

import org.springframework.http.HttpStatus;

/** Rejected upload: wrong type, mismatched extension, unreadable or too large. */
public class InvalidFileException extends ApiException {

    public InvalidFileException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
