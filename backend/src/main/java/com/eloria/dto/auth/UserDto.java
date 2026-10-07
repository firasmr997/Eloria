package com.eloria.dto.auth;

import com.eloria.entity.Role;

public record UserDto(Long id, String name, String email, Role role) {
}
