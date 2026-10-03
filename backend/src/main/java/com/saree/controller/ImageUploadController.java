package com.saree.controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.saree.service.StorageService;

/**
 * Admin-only endpoint for product image uploads.
 * <p>
 * Route: {@code POST /api/admin/products/upload-image}
 * <p>
 * Security: protected by the existing JWT filter chain ({@code /api/admin/**}
 * requires {@code ROLE_ADMIN}).  No changes to {@link com.saree.security.SecurityConfig}
 * are needed – the route is already covered.
 * <p>
 * The endpoint accepts a {@code multipart/form-data} request with a single
 * {@code file} part, validates MIME type and size, delegates storage to
 * {@link StorageService}, and returns the public URL to store in
 * {@code Product.imageUrl}.
 */
@RestController
@RequestMapping("/api/admin/products")
public class ImageUploadController {

    /** Allowed image MIME types (browser-reported, also re-validated in storage layer). */
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    /** Frontend-visible size limit (5 MB). Service layer also enforces this. */
    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final StorageService storageService;

    public ImageUploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * Upload a product image.
     *
     * @param file multipart file part named {@code "file"}
     * @return {@code 200 OK} with {@code {"imageUrl": "<public-url>"}} on success,
     *         {@code 400 Bad Request} with {@code {"error": "<reason>"}} on validation failure
     */
    @PostMapping(
            value = "/upload-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file) {

        // --- Frontend validation mirroring ---
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "No file was provided or the file is empty."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            "Invalid image type: " + contentType +
                            ". Accepted formats: JPEG, PNG, WebP, GIF."));
        }

        if (file.getSize() > MAX_BYTES) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            "Image is too large (" + (file.getSize() / 1024 / 1024) + " MB). "
                            + "Maximum allowed size is 5 MB."));
        }

        try {
            String imageUrl = storageService.store(file);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to store image. Please try again."));
        }
    }
}
