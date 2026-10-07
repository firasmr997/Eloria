package com.eloria.storage;

import java.io.InputStream;
import java.util.Optional;

/**
 * Provider-neutral image storage. {@link LocalImageStorageService} writes to disk for development; a
 * Cloudinary, AWS S3 or Cloudflare R2 implementation only needs to implement this interface and be selected
 * with {@code eloria.storage.type} (STORAGE_TYPE). Nothing else in the application touches files directly.
 */
public interface ImageStorageService {

    /**
     * Stores the image bytes.
     *
     * @param content     image bytes (the caller has already validated type and size)
     * @param extension   lowercase extension without the dot, e.g. {@code webp}
     * @param contentType validated MIME type
     */
    StoredImage upload(InputStream content, long size, String extension, String contentType, StorageFolder folder);

    /** Deletes the image if it exists. Missing files are ignored. */
    void delete(String storageKey);

    /** Stores the new image, then deletes the previous one. */
    default StoredImage replace(String previousStorageKey, InputStream content, long size, String extension,
                                String contentType, StorageFolder folder) {
        StoredImage stored = upload(content, size, extension, contentType, folder);
        if (previousStorageKey != null && !previousStorageKey.isBlank()) {
            delete(previousStorageKey);
        }
        return stored;
    }

    /** Public URL for a storage key. */
    String getUrl(String storageKey);

    /**
     * The storage key behind a public URL produced by this provider, or empty for anything else (for example
     * the external placeholder photography used by the demo data, which must never be deleted).
     */
    Optional<String> keyFromUrl(String url);
}
