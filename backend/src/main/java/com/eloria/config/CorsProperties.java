package com.eloria.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Origins allowed to call the API from a browser; from CORS_ALLOWED_ORIGINS (comma separated). */
@ConfigurationProperties(prefix = "eloria.cors")
public record CorsProperties(List<String> allowedOrigins) {

    public CorsProperties {
        allowedOrigins = allowedOrigins == null ? List.of()
                : allowedOrigins.stream().map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
