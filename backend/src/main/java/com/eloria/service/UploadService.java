package com.eloria.service;

import com.eloria.dto.upload.UploadResponse;
import com.eloria.exception.BadRequestException;
import com.eloria.exception.ConflictException;
import com.eloria.exception.StorageException;
import com.eloria.storage.ImageFileValidator;
import com.eloria.storage.ImageStorageService;
import com.eloria.storage.StorageFolder;
import com.eloria.storage.StoredImage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final ImageFileValidator validator;
    private final ImageStorageService storage;
    private final ImageReferenceService imageReferences;

    public UploadResponse upload(MultipartFile file, String folderValue) {
        StorageFolder folder = StorageFolder.fromValue(folderValue)
                .orElseThrow(() -> new BadRequestException("Unknown folder. Use treatments, gallery, results or team"));
        ImageFileValidator.ValidatedImage image = validator.validate(file);
        try (InputStream content = file.getInputStream()) {
            StoredImage stored = storage.upload(content, image.size(), image.extension(), image.contentType(), folder);
            log.info("Image uploaded: {} ({} bytes)", stored.storageKey(), stored.size());
            return new UploadResponse(stored.url(), stored.storageKey(), stored.contentType(), stored.size());
        } catch (IOException e) {
            throw new StorageException("Could not read upload", e);
        }
    }

    /** Deletes an upload that was never attached to any content (e.g. a form closed without saving). */
    @Transactional(readOnly = true)
    public void deleteUnused(String url) {
        String key = storage.keyFromUrl(url)
                .orElseThrow(() -> new BadRequestException("Only uploaded images can be deleted this way"));
        if (imageReferences.isReferenced(url)) {
            throw new ConflictException("This image is still used on the website");
        }
        storage.delete(key);
        log.info("Unused image deleted: {}", key);
    }
}
