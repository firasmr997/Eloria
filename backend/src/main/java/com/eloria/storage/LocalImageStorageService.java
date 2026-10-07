package com.eloria.storage;

import com.eloria.config.StorageProperties;
import com.eloria.exception.StorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

/** Stores uploads on the local file system under {@code eloria.storage.upload-directory}. */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "eloria.storage", name = "type", havingValue = "local", matchIfMissing = true)
public class LocalImageStorageService implements ImageStorageService {

    /** Keys this provider generates: {@code <folder>/<uuid>.<ext>}. */
    public static final Pattern KEY_PATTERN =
            Pattern.compile("^(treatments|gallery|results|team)/[0-9a-f-]{36}\\.(jpg|png|webp|avif)$");

    private final Path root;
    private final String publicBaseUrl;

    public LocalImageStorageService(StorageProperties properties) {
        this.root = Path.of(properties.uploadDirectory()).toAbsolutePath().normalize();
        this.publicBaseUrl = trimTrailingSlash(properties.publicBaseUrl());
        try {
            for (StorageFolder folder : StorageFolder.values()) {
                Files.createDirectories(root.resolve(folder.path()));
            }
        } catch (IOException e) {
            throw new StorageException("Could not initialise upload directory " + root, e);
        }
        log.info("Local image storage at {}", root);
    }

    @Override
    public StoredImage upload(InputStream content, long size, String extension, String contentType, StorageFolder folder) {
        String key = folder.path() + "/" + UUID.randomUUID() + "." + extension;
        Path target = resolve(key);
        try {
            Files.copy(content, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new StorageException("Could not store image " + key, e);
        }
        return new StoredImage(key, getUrl(key), contentType, size);
    }

    @Override
    public void delete(String storageKey) {
        if (storageKey == null || !KEY_PATTERN.matcher(storageKey).matches()) {
            return;
        }
        try {
            Files.deleteIfExists(resolve(storageKey));
        } catch (IOException e) {
            // Deleting is best effort: a leftover file is harmless, a failed request is not.
            log.warn("Could not delete stored image {}: {}", storageKey, e.getMessage());
        }
    }

    @Override
    public String getUrl(String storageKey) {
        return publicBaseUrl + "/" + storageKey;
    }

    @Override
    public Optional<String> keyFromUrl(String url) {
        if (url == null || !url.startsWith(publicBaseUrl + "/")) {
            return Optional.empty();
        }
        String key = url.substring(publicBaseUrl.length() + 1);
        return KEY_PATTERN.matcher(key).matches() ? Optional.of(key) : Optional.empty();
    }

    /** Resolves a key inside the root, rejecting anything that would escape it. */
    private Path resolve(String storageKey) {
        Path resolved = root.resolve(storageKey).normalize();
        if (!resolved.startsWith(root)) {
            throw new StorageException("Invalid storage key");
        }
        return resolved;
    }

    private static String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
