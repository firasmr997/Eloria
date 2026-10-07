package com.eloria.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * @param secret     HMAC key, at least 32 bytes; from JWT_SECRET
 * @param expiration token lifetime; from JWT_EXPIRATION (e.g. {@code 12h})
 * @param issuer     value of the {@code iss} claim
 */
@ConfigurationProperties(prefix = "eloria.jwt")
public record JwtProperties(String secret, Duration expiration, String issuer) {

    public JwtProperties {
        if (expiration == null) {
            expiration = Duration.ofHours(12);
        }
        if (issuer == null || issuer.isBlank()) {
            issuer = "eloria-api";
        }
    }
}
