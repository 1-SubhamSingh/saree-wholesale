package com.saree.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.saree.model.Product;
import com.saree.repository.ProductRepository;

class ProductServiceTest {

    private ProductRepository repository;
    private StorageService storageService;
    private ProductService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProductRepository.class);
        storageService = mock(StorageService.class);
        service = new ProductService(repository, storageService);
    }

    @Test
    void replacesManagedImage() {
        Product existing = new Product();
        existing.setId("1");
        existing.setImageUrl("http://localhost:8080/api/uploads/old.jpg");

        Product updated = new Product();
        updated.setImageUrl("http://localhost:8080/api/uploads/new.jpg");

        when(repository.findById("1")).thenReturn(Optional.of(existing));
        when(repository.save(updated)).thenReturn(updated);

        service.updateProduct("1", updated);

        verify(storageService).delete(existing.getImageUrl());
    }

    @Test
    void keepsExistingImageWhenUrlUnchanged() {
        Product existing = new Product();
        existing.setId("1");
        existing.setImageUrl("http://localhost:8080/api/uploads/image.jpg");

        Product updated = new Product();
        updated.setImageUrl(existing.getImageUrl());

        when(repository.findById("1")).thenReturn(Optional.of(existing));
        when(repository.save(updated)).thenReturn(updated);

        service.updateProduct("1", updated);

        verify(storageService, never()).delete(anyString());
    }

    @Test
    void deletesManagedImageWithProduct() {
        Product existing = new Product();
        existing.setId("1");
        existing.setImageUrl("http://localhost:8080/api/uploads/image.jpg");

        when(repository.findById("1")).thenReturn(Optional.of(existing));

        service.deleteProduct("1");

        verify(repository).deleteById("1");
        verify(storageService).delete(existing.getImageUrl());
    }

    @Test
    void handlesProductWithoutImage() {
        Product existing = new Product();
        existing.setId("1");

        when(repository.findById("1")).thenReturn(Optional.of(existing));

        service.deleteProduct("1");

        verify(repository).deleteById("1");
        verify(storageService).delete(null);
    }

    @Test
    void handlesExistingExternalImageUrlProduct() {
        Product existing = new Product();
        existing.setId("legacy-1");
        existing.setImageUrl("https://images.unsplash.com/photo-legacy");

        Product updated = new Product();
        updated.setId("legacy-1");
        updated.setImageUrl("https://images.unsplash.com/photo-legacy-v2");

        when(repository.findById("legacy-1")).thenReturn(Optional.of(existing));
        when(repository.save(updated)).thenReturn(updated);

        Product result = service.updateProduct("legacy-1", updated);

        assertNotNull(result);
        assertEquals("https://images.unsplash.com/photo-legacy-v2", result.getImageUrl());
        verify(storageService).delete("https://images.unsplash.com/photo-legacy");
    }
}
