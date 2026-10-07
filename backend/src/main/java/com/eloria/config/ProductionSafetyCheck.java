package com.eloria.config;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Locale;

/** Refuses to start the prod profile with development secrets or wildcard CORS. */
@Component
@Profile("prod")
public class ProductionSafetyCheck implements InitializingBean {

    private final JwtProperties jwtProperties;
    private final CorsProperties corsProperties;

    public ProductionSafetyCheck(JwtProperties jwtProperties, CorsProperties corsProperties) {
        this.jwtProperties = jwtProperties;
        this.corsProperties = corsProperties;
    }

    @Override
    public void afterPropertiesSet() {
        String secret = jwtProperties.secret();
        if (secret == null || secret.toLowerCase(Locale.ROOT).contains("dev-only")) {
            throw new IllegalStateException("Production requires a real JWT_SECRET (the development default was detected)");
        }
        if (corsProperties.allowedOrigins().isEmpty() || corsProperties.allowedOrigins().contains("*")) {
            throw new IllegalStateException("Production requires explicit CORS_ALLOWED_ORIGINS (no wildcard)");
        }
    }
}
