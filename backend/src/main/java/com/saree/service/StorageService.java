package com.saree.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Storage abstraction layer for product images.
 * <p>
 * Implementations can swap between local file storage, S3, GCS, or any
 * object store without touching the product API or controller layer.
 * The contract:
 * <ul>
 *   <li>{@link #store} accepts a validated {@link MultipartFile}, persists it and
 *       returns a public-accessible URL/path stored in {@code Product.imageUrl}.</li>
 *   <li>{@link #delete} removes a previously stored file identified by its URL/key.
 *       Failures are swallowed so that product deletes are never blocked by
 *       orphaned images.</li>
 * </ul>
 */
public interface StorageService {

    /**
     * Persist the uploaded file and return the public URL that can be stored
     * as {@code Product.imageUrl} and served to clients.
     *
     * @param file validated multipart upload; must not be null / empty
     * @return absolute public URL (e.g. {@code http://host/api/uploads/abc.jpg})
     *         or a relative path that the frontend can resolve
     */
    String store(MultipartFile file);

    /**
     * Remove a previously uploaded file.  Implementations MUST NOT throw –
     * log the error and return silently if the file is missing or cannot be
     * deleted, so that product-delete flows are never interrupted.
     *
     * @param imageUrl the value previously returned by {@link #store}
     */
    void delete(String imageUrl);
}
