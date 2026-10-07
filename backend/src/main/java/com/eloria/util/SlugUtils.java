package com.eloria.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;

/** URL slugs: "Hydrafacial Signature" becomes "hydrafacial-signature", "Peeling à l'acide" becomes "peeling-a-l-acide". */
public final class SlugUtils {

    private static final int MAX_LENGTH = 120;

    private SlugUtils() {
    }

    public static String slugify(String input) {
        if (input == null) {
            return "";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+)|(-+$)", "");
        if (normalized.length() > MAX_LENGTH) {
            normalized = normalized.substring(0, MAX_LENGTH).replaceAll("-+$", "");
        }
        return normalized;
    }

    /** Slugifies and appends -2, -3 ... until {@code taken} says the slug is free. */
    public static String unique(String input, Predicate<String> taken) {
        String base = slugify(input);
        if (base.isEmpty()) {
            base = "item";
        }
        String candidate = base;
        int suffix = 2;
        while (taken.test(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }
}
