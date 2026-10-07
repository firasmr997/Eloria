package com.eloria.storage;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

/** Upload destinations: /uploads/treatments, /uploads/gallery, /uploads/results, /uploads/team. */
public enum StorageFolder {
    TREATMENTS("treatments"),
    GALLERY("gallery"),
    RESULTS("results"),
    TEAM("team");

    private final String path;

    StorageFolder(String path) {
        this.path = path;
    }

    public String path() {
        return path;
    }

    public static Optional<StorageFolder> fromValue(String value) {
        if (value == null) {
            return Optional.empty();
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return Arrays.stream(values()).filter(f -> f.path.equals(normalized)).findFirst();
    }
}
