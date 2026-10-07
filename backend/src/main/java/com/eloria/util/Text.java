package com.eloria.util;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/** Small string helpers shared by services and specifications. */
public final class Text {

    private Text() {
    }

    /** Trims, and turns blank strings into null. */
    public static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /** Lower-cased LIKE pattern with %, _ and \ escaped, or null when there is nothing to search. */
    public static String likePattern(String query) {
        String cleaned = clean(query);
        if (cleaned == null) {
            return null;
        }
        String escaped = cleaned.toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escaped + "%";
    }

    /** Splits newline-separated storage into a list of non-blank trimmed lines. */
    public static List<String> lines(String stored) {
        if (stored == null || stored.isBlank()) {
            return List.of();
        }
        return Arrays.stream(stored.split("\\R"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    /** Joins list items into newline-separated storage, dropping blanks and line breaks inside items. */
    public static String joinLines(List<String> items) {
        if (items == null) {
            return null;
        }
        List<String> cleaned = items.stream()
                .map(Text::clean)
                .filter(s -> s != null)
                .map(s -> s.replaceAll("\\R+", " "))
                .toList();
        return cleaned.isEmpty() ? null : String.join("\n", cleaned);
    }
}
