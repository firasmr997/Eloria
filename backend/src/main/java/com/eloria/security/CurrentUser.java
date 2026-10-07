package com.eloria.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/** Static access to the signed-in staff member, for visibility rules on public endpoints. */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static Optional<AppUserDetails> get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken
                || !(authentication.getPrincipal() instanceof AppUserDetails user)) {
            return Optional.empty();
        }
        return Optional.of(user);
    }

    /** True when the request comes from authenticated staff (ADMIN or EDITOR). */
    public static boolean isStaff() {
        return get().isPresent();
    }
}
