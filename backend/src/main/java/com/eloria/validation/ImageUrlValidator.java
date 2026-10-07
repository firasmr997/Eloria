package com.eloria.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.regex.Pattern;

public class ImageUrlValidator implements ConstraintValidator<ImageUrl, String> {

    private static final Pattern RELATIVE_PATH = Pattern.compile("^/[A-Za-z0-9._~/-]+$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }
        String trimmed = value.trim();
        if (trimmed.startsWith("/")) {
            return RELATIVE_PATH.matcher(trimmed).matches() && !trimmed.contains("..");
        }
        try {
            URI uri = new URI(trimmed);
            String scheme = uri.getScheme();
            return ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme)) && uri.getHost() != null;
        } catch (URISyntaxException e) {
            return false;
        }
    }
}
