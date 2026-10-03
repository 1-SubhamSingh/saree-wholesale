package com.saree.service;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

class LocalFileStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalFileStorageService service;

    @BeforeEach
    void setUp() {
        service = new LocalFileStorageService(tempDir.toString());
    }

    @Test
    void storesValidImageWithUniqueName() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "saree.jpg", "image/jpeg", new byte[]{(byte)0xff, (byte)0xd8, (byte)0xff, 1, 2, 3});

        String url = service.store(file);

        assertTrue(url.contains("/api/uploads/"));
        String name = url.substring(url.lastIndexOf('/') + 1);
        assertTrue(Files.exists(tempDir.resolve(name)));
        assertNotEquals("saree.jpg", name);
    }

    @Test
    void rejectsInvalidType() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", new byte[]{1});

        assertThrows(IllegalArgumentException.class, () -> service.store(file));
    }

    @Test
    void rejectsOversizedFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.jpg", "image/jpeg", new byte[5 * 1024 * 1024 + 1]);

        assertThrows(IllegalArgumentException.class, () -> service.store(file));
    }

    @Test
    void deletesManagedImage() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "saree.png", "image/png", new byte[]{(byte)0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3});

        String url = service.store(file);
        String name = url.substring(url.lastIndexOf('/') + 1);

        service.delete(url);

        assertFalse(Files.exists(tempDir.resolve(name)));
    }

    @Test
    void doesNotDeleteExternalImageUrl() throws Exception {
        Path external = tempDir.resolve("external.jpg");
        Files.write(external, new byte[]{1});

        service.delete("https://example.com/external.jpg");

        assertTrue(Files.exists(external));
    }
}
