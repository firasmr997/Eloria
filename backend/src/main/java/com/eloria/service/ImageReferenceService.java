package com.eloria.service;

import com.eloria.repository.GalleryImageRepository;
import com.eloria.repository.ResultRepository;
import com.eloria.repository.SpecialistRepository;
import com.eloria.repository.TreatmentImageRepository;
import com.eloria.repository.TreatmentRepository;
import com.eloria.storage.ImageStorageService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Knows which stored files content still points at, and deletes uploads nothing references any more,
 * but only after the surrounding transaction commits: a rolled-back update must never lose its images.
 * External URLs (the demo placeholder photography) are never touched.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImageReferenceService {

    private final ImageStorageService storage;
    private final TreatmentRepository treatmentRepository;
    private final TreatmentImageRepository treatmentImageRepository;
    private final GalleryImageRepository galleryImageRepository;
    private final ResultRepository resultRepository;
    private final SpecialistRepository specialistRepository;
    private final EntityManager entityManager;

    public boolean isReferenced(String url) {
        return treatmentRepository.existsByMainImageUrl(url)
                || treatmentImageRepository.existsByImageUrl(url)
                || galleryImageRepository.existsByImageUrl(url)
                || resultRepository.existsByBeforeImageUrl(url)
                || resultRepository.existsByAfterImageUrl(url)
                || specialistRepository.existsByPhoto(url);
    }

    /** Must be called inside a transaction, after the entity changes have been applied. */
    public void deleteUnreferencedAfterCommit(Collection<String> urls) {
        if (urls == null || urls.isEmpty()) {
            return;
        }
        entityManager.flush();
        Set<String> orphanedKeys = new LinkedHashSet<>();
        for (String url : urls) {
            if (url == null || url.isBlank()) {
                continue;
            }
            storage.keyFromUrl(url).ifPresent(key -> {
                if (!isReferenced(url)) {
                    orphanedKeys.add(key);
                }
            });
        }
        if (orphanedKeys.isEmpty()) {
            return;
        }
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    orphanedKeys.forEach(ImageReferenceService.this::deleteQuietly);
                }
            });
        } else {
            orphanedKeys.forEach(this::deleteQuietly);
        }
    }

    private void deleteQuietly(String key) {
        try {
            storage.delete(key);
            log.debug("Deleted unreferenced image {}", key);
        } catch (RuntimeException e) {
            log.warn("Could not delete image {}: {}", key, e.getMessage());
        }
    }
}
