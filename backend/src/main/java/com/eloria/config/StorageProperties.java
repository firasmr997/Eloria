package com.eloria.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

/**
 * @param type            storage provider, {@code local} by default
 * @param uploadDirectory root directory for local uploads
 * @param publicBaseUrl   URL prefix the files are served from (relative {@code /uploads} or an absolute CDN/API URL)
 * @param maxFileSize     largest accepted image
 */
@ConfigurationProperties(prefix = "eloria.storage")
public record StorageProperties(String type, String uploadDirectory, String publicBaseUrl, DataSize maxFileSize) {

    public StorageProperties {
        if (type == null || type.isBlank()) {
            type = "local";
        }
        if (uploadDirectory == null || uploadDirectory.isBlank()) {
            uploadDirectory = "./uploads";
        }
        if (publicBaseUrl == null || publicBaseUrl.isBlank()) {
            publicBaseUrl = "/uploads";
        }
        if (maxFileSize == null) {
            maxFileSize = DataSize.ofMegabytes(8);
        }
    }
}
