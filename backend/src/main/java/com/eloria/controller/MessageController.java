package com.eloria.controller;

import com.eloria.config.OpenApiConfig;
import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.common.PageResponse;
import com.eloria.dto.message.ContactMessageDto;
import com.eloria.dto.message.MessageUpdateRequest;
import com.eloria.entity.MessageStatus;
import com.eloria.service.MessageService;
import com.eloria.util.Paging;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Messages")
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MessageController {

    private final MessageService messageService;

    @Operation(summary = "List contact messages",
            description = "Newest first; filter by status, or `inbox=true` for everything not archived; search name, email or text.")
    @GetMapping
    public ApiResponse<PageResponse<ContactMessageDto>> list(
            @RequestParam(required = false) MessageStatus status,
            @RequestParam(defaultValue = "false") boolean inbox,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Paging.check(page, size);
        return ApiResponse.ok(messageService.list(status, inbox, q, page, size));
    }

    @Operation(summary = "Number of NEW messages")
    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> unreadCount() {
        return ApiResponse.ok(Map.of("count", messageService.unreadCount()));
    }

    @Operation(summary = "Get a message")
    @GetMapping("/{id}")
    public ApiResponse<ContactMessageDto> get(@PathVariable Long id) {
        return ApiResponse.ok(messageService.get(id));
    }

    @Operation(summary = "Mark as read, archive or restore")
    @PutMapping("/{id}")
    public ApiResponse<ContactMessageDto> update(@PathVariable Long id, @Valid @RequestBody MessageUpdateRequest request) {
        return ApiResponse.ok(messageService.update(id, request), "Message updated");
    }

    @Operation(summary = "Delete a message")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        messageService.delete(id);
        return ApiResponse.message("Message deleted");
    }
}
