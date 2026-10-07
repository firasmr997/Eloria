package com.eloria.dto.upload;

public record UploadResponse(String url, String storageKey, String contentType, long size) {
}
