package com.eloria.controller;

import com.eloria.dto.common.ApiResponse;
import com.eloria.dto.message.ContactRequest;
import com.eloria.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Messages")
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final MessageService messageService;

    @Operation(summary = "Send a message", description = "Public contact form. Rate limited per address (HTTP 429).")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> submit(@Valid @RequestBody ContactRequest request, HttpServletRequest http) {
        messageService.submit(request, http.getRemoteAddr());
        return ApiResponse.message("Thank you. Your message has been sent and we will reply shortly.");
    }
}
