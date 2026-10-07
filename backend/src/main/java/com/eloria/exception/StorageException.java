package com.eloria.exception;

/** Unexpected storage failure (disk, cloud provider). Logged in full, reported generically. */
public class StorageException extends RuntimeException {

    public StorageException(String message) {
        super(message);
    }

    public StorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
