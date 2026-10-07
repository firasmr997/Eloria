package com.eloria.storage;

/**
 * @param storageKey provider-neutral key, e.g. {@code gallery/2f1c...e9.webp}
 * @param url        public URL to reference from content
 */
public record StoredImage(String storageKey, String url, String contentType, long size) {
}
