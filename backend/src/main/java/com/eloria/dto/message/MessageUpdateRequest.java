package com.eloria.dto.message;

import com.eloria.entity.MessageStatus;
import jakarta.validation.constraints.NotNull;

public record MessageUpdateRequest(@NotNull MessageStatus status) {
}
