package com.eloria.util;

import com.eloria.exception.BadRequestException;

/** Validates page / size query parameters shared by every list endpoint. */
public final class Paging {

    public static final int MAX_SIZE = 100;

    private Paging() {
    }

    public static void check(int page, int size) {
        if (page < 0) {
            throw new BadRequestException("page must be zero or greater");
        }
        if (size < 1 || size > MAX_SIZE) {
            throw new BadRequestException("size must be between 1 and " + MAX_SIZE);
        }
    }
}
