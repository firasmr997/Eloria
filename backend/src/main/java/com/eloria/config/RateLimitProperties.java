package com.eloria.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * @param loginAttempts     failed sign-ins allowed per IP and email within {@code loginWindow}
 * @param publicSubmissions appointment requests or contact messages allowed per IP within {@code publicWindow}
 */
@ConfigurationProperties(prefix = "eloria.rate-limit")
public record RateLimitProperties(int loginAttempts, Duration loginWindow, int publicSubmissions, Duration publicWindow) {

    public RateLimitProperties {
        if (loginAttempts <= 0) {
            loginAttempts = 10;
        }
        if (loginWindow == null) {
            loginWindow = Duration.ofMinutes(15);
        }
        if (publicSubmissions <= 0) {
            publicSubmissions = 6;
        }
        if (publicWindow == null) {
            publicWindow = Duration.ofMinutes(10);
        }
    }
}
