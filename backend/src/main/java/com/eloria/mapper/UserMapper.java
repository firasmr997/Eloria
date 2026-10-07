package com.eloria.mapper;

import com.eloria.dto.auth.UserDto;
import com.eloria.entity.User;
import com.eloria.security.AppUserDetails;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public UserDto toDto(AppUserDetails user) {
        return new UserDto(user.id(), user.name(), user.email(), user.role());
    }
}
