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

    @Test
    void getActiveProducts_fallsBackToActiveRepository() {
        Product p = new Product();
        p.setActive(true);
        when(repository.findByActiveTrue()).thenReturn(java.util.List.of(p));

        var result = service.getActiveProducts();

        assertEquals(1, result.size());
        assertSame(p, result.get(0));
        verify(repository).findByActiveTrue();
    }

    @Test
    void getFilterOptions_fallsBackToActiveRepository() {
        Product p1 = new Product();
        p1.setActive(true);
        p1.setCategory("Banarasi Weave");
        p1.setFabric("Silk");
        p1.setColor("Red");

        Product p2 = new Product();
        p2.setActive(true);
        p2.setCategory("Banarasi Weave");
        p2.setFabric("Silk");
        p2.setColor("Red");

        when(repository.findByActiveTrue()).thenReturn(java.util.List.of(p1, p2));

        var result = service.getFilterOptions();

        assertEquals(java.util.List.of("Banarasi Weave"), result.getCategories());
        assertEquals(java.util.List.of("Silk"), result.getFabrics());
        assertEquals(java.util.List.of("Red"), result.getColors());
    }

    @Test
    void getProducts_fallsBackToRepositoryWhenMongoTemplateNull() {
        org.springframework.data.domain.Page<Product> mockPage = new org.springframework.data.domain.PageImpl<>(java.util.List.of(new Product()));
        when(repository.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(mockPage);

        org.springframework.data.domain.Page<Product> result = service.getProducts(
                0, 12, null, null, null, null, null, null, null, null);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(repository).findAll(any(org.springframework.data.domain.Pageable.class));
    }
}
