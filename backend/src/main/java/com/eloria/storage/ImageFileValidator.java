package com.eloria.storage;

import com.eloria.config.StorageProperties;
import com.eloria.exception.InvalidFileException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Validates uploads on three independent signals: declared MIME type, file extension and the file's
 * actual leading bytes (magic number). All three must agree on an allowed image format.
 */
@Component
public class ImageFileValidator {

    /** Allowed MIME type -> accepted extensions. */
    private static final Map<String, Set<String>> ALLOWED = Map.of(
            "image/jpeg", Set.of("jpg", "jpeg"),
            "image/png", Set.of("png"),
            "image/webp", Set.of("webp"),
            "image/avif", Set.of("avif"));

    private final long maxBytes;

    public ImageFileValidator(StorageProperties properties) {
        this.maxBytes = properties.maxFileSize().toBytes();
    }

    public ValidatedImage validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Please choose an image to upload");
        }
        if (file.getSize() > maxBytes) {
            throw new InvalidFileException("Image is too large. Maximum size is " + (maxBytes / (1024 * 1024)) + " MB");
        }

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        extension = extension == null ? "" : extension.toLowerCase(Locale.ROOT);
        String declaredType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);

        Set<String> extensionsForType = ALLOWED.get(declaredType);
        if (extensionsForType == null) {
            throw new InvalidFileException("Unsupported image type. Use JPG, PNG, WebP or AVIF");
        }
        if (!extensionsForType.contains(extension)) {
            throw new InvalidFileException("File extension does not match its type. Use .jpg, .png, .webp or .avif");
        }

        String sniffedType = sniff(file);
        if (!declaredType.equals(sniffedType)) {
            throw new InvalidFileException("File content is not a valid " + extension.toUpperCase(Locale.ROOT) + " image");
        }
        return new ValidatedImage(declaredType, "jpeg".equals(extension) ? "jpg" : extension, file.getSize());
    }

    private String sniff(MultipartFile file) {
        byte[] head = new byte[16];
        int read;
        try (InputStream in = file.getInputStream()) {
            read = in.readNBytes(head, 0, head.length);
        } catch (IOException e) {
            throw new InvalidFileException("Could not read the uploaded file");
        }
        if (read >= 3 && (head[0] & 0xFF) == 0xFF && (head[1] & 0xFF) == 0xD8 && (head[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (read >= 8 && Arrays.equals(Arrays.copyOf(head, 8),
                new byte[]{(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n'})) {
            return "image/png";
        }
        if (read >= 12 && ascii(head, 0, 4).equals("RIFF") && ascii(head, 8, 4).equals("WEBP")) {
            return "image/webp";
        }
        if (read >= 12 && ascii(head, 4, 4).equals("ftyp")) {
            String brand = ascii(head, 8, 4);
            if (brand.equals("avif") || brand.equals("avis")) {
                return "image/avif";
            }
        }
        return "unknown";
    }

    private static String ascii(byte[] bytes, int offset, int length) {
        return new String(bytes, offset, length, StandardCharsets.US_ASCII);
    }

    public record ValidatedImage(String contentType, String extension, long size) {
    }
}
