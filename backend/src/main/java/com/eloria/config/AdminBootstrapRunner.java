package com.eloria.config;

import com.eloria.entity.Role;
import com.eloria.entity.User;
import com.eloria.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/**
 * Creates the administrator described by ADMIN_EMAIL / ADMIN_PASSWORD on startup if that account does
 * not exist yet. This is how production gets its first account; credentials are never committed.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements ApplicationRunner {

    private final AdminProperties adminProperties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!adminProperties.isConfigured()) {
            if (userRepository.count() == 0) {
                log.warn("No staff accounts exist. Set ADMIN_EMAIL and ADMIN_PASSWORD to create the first administrator.");
            }
            return;
        }
        String email = adminProperties.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return;
        }
        if (adminProperties.password().length() < 10) {
            throw new IllegalStateException("ADMIN_PASSWORD must be at least 10 characters long");
        }
        User admin = new User();
        admin.setEmail(email);
        admin.setName(adminProperties.name() == null || adminProperties.name().isBlank()
                ? "Éloria Administrator" : adminProperties.name());
        admin.setPassword(passwordEncoder.encode(adminProperties.password()));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        log.info("Created administrator account {}", admin.getEmail());
    }
}
