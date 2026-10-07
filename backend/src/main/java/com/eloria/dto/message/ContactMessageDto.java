package com.eloria.dto.message;

import com.eloria.entity.MessageStatus;

import java.time.Instant;

public record ContactMessageDto(
        Long id,
        String name,
        String email,
        String phone,
        String message,
        MessageStatus status,
        Instant createdAt,
        Instant updatedAt) {
}
