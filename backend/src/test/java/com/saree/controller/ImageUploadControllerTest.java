package com.saree.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import com.saree.service.StorageService;

class ImageUploadControllerTest {

    private StorageService storageService;
    private ImageUploadController controller;

    @BeforeEach
    void setUp() {
        storageService = mock(StorageService.class);
        controller = new ImageUploadController(storageService);
    }

    @Test
    void uploadsValidImage() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "saree.jpg", "image/jpeg",
                new byte[]{(byte) 0xff, (byte) 0xd8, (byte) 0xff});

        when(storageService.store(file)).thenReturn("http://localhost:8080/api/uploads/test.jpg");

        ResponseEntity<Map<String, String>> response = controller.uploadImage(file);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("http://localhost:8080/api/uploads/test.jpg", response.getBody().get("imageUrl"));
        verify(storageService).store(file);
    }

    @Test
    void rejectsMissingImage() {
        MockMultipartFile file = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);

        ResponseEntity<Map<String, String>> response = controller.uploadImage(file);

        assertEquals(400, response.getStatusCode().value());
        verifyNoInteractions(storageService);
    }

    @Test
    void rejectsInvalidType() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", new byte[]{1});

        ResponseEntity<Map<String, String>> response = controller.uploadImage(file);

        assertEquals(400, response.getStatusCode().value());
        verifyNoInteractions(storageService);
    }

    @Test
    void rejectsOversizedImage() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.jpg", "image/jpeg", new byte[5 * 1024 * 1024 + 1]);

        ResponseEntity<Map<String, String>> response = controller.uploadImage(file);

        assertEquals(400, response.getStatusCode().value());
        verifyNoInteractions(storageService);
    }
}
