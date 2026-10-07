package com.eloria.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Optional bootstrap administrator from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME. */
@ConfigurationProperties(prefix = "eloria.admin")
public record AdminProperties(String email, String password, String name) {

    public boolean isConfigured() {
        return email != null && !email.isBlank() && password != null && !password.isBlank();
    }
}
