package com.saree.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Local-filesystem implementation of {@link StorageService}.
 * <p>
 * Files are stored in a configurable directory outside the source tree
 * (default: {@code ./uploads} relative to the working directory, overridable
 * via the {@code app.upload.dir} property or the {@code UPLOAD_DIR} env var).
 * <p>
 * The upload directory is created on startup if it does not already exist.
 * Files are given a UUID-prefixed name to guarantee uniqueness and prevent
 * filename-guessing attacks. The original extension is preserved for correct
 * MIME sniffing by browsers.
 * <p>
 * Security hardening applied:
 * <ul>
 *   <li>Only image MIME types are accepted (validated by the controller,
 *       double-checked here).</li>
 *   <li>Path traversal is blocked via {@link Path#normalize()} + checking
 *       the resolved path starts with the upload root.</li>
 *   <li>The original filename is never used as-is for storage.</li>
 * </ul>
 * <p>
 * To switch to S3: implement {@link StorageService} with the AWS SDK and mark
 * this bean {@code @Profile("local")} / the S3 bean {@code @Profile("s3")}.
 */
@Service
public class LocalFileStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalFileStorageService.class);

    /** Allowed MIME types – reject anything else at the storage layer too. */
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    /** Max file size enforced here (5 MB) in addition to multipart config. */
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;

    /**
     * URL prefix that the backend will use to serve files.
     * Must match the path registered in {@code WebConfig}.
     */
    private static final String URL_PREFIX = "/api/uploads/";

    private final Path uploadRoot;

    /** The publicly reachable base URL of the backend (for building absolute URLs). */
    @Value("${app.public-url:http://localhost:8080}")
    private String publicUrl;

    public LocalFileStorageService(
            @Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadRoot);
            log.info("Upload directory initialised at: {}", this.uploadRoot);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Cannot initialise upload directory: " + this.uploadRoot, e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file must not be null or empty.");
        }

        // MIME type guard (also validated in controller, but defence-in-depth)
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported image type: " + contentType +
                    ". Allowed: JPEG, PNG, WebP, GIF.");
        }

        // Size guard
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException(
                    "Image exceeds maximum allowed size of 5 MB (received " +
                    file.getSize() + " bytes).");
        }

        // Derive a safe extension from the original filename
        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload");
        String ext = deriveExtension(originalFilename, contentType);
        String storedFilename = UUID.randomUUID() + ext;

        // Path-traversal guard
        Path destination = this.uploadRoot.resolve(storedFilename).normalize();
        if (!destination.startsWith(this.uploadRoot)) {
            throw new SecurityException("Path traversal attempt detected: " + storedFilename);
        }

        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored upload: {} ({} bytes)", destination, file.getSize());
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded file.", e);
        }

        // Return an absolute URL so the frontend can use it directly
        return publicUrl.stripTrailing() + URL_PREFIX + storedFilename;
    }

    @Override
    public void delete(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        // Only delete files we actually manage (uploaded ones have our URL prefix)
        String prefix = publicUrl.stripTrailing() + URL_PREFIX;
        if (!imageUrl.startsWith(prefix)) {
            log.debug("Skipping delete – image URL not managed by local storage: {}", imageUrl);
            return;
        }
        String filename = imageUrl.substring(prefix.length());
        Path filePath = this.uploadRoot.resolve(filename).normalize();
        if (!filePath.startsWith(this.uploadRoot)) {
            log.warn("Delete path traversal blocked for: {}", filename);
            return;
        }
        try {
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("Deleted upload: {}", filePath);
            } else {
                log.warn("Upload file not found for deletion: {}", filePath);
            }
        } catch (IOException e) {
            log.error("Failed to delete upload {}: {}", filePath, e.getMessage());
        }
    }

    // -----------------------------------------------------------------------

    /** Extract a lowercase extension from the filename; fall back to MIME type. */
    private String deriveExtension(String originalFilename, String contentType) {
        int dot = originalFilename.lastIndexOf('.');
        if (dot >= 0) {
            String raw = originalFilename.substring(dot).toLowerCase();
            if (raw.matches("\\.[a-z0-9]{2,5}")) {
                return raw;
            }
        }
        // Derive from MIME if filename has no usable extension
        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png"  -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif"  -> ".gif";
            default           -> ".jpg";
        };
    }
}
