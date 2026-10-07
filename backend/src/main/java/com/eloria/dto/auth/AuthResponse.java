package com.eloria.dto.auth;

import java.time.Instant;

public record AuthResponse(String token, String tokenType, Instant expiresAt, UserDto user) {
}
