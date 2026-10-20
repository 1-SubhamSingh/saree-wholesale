package com.saree.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.saree.exception.DuplicateSkuException;
import com.saree.exception.ProductNotFoundException;
import com.saree.model.Product;
import com.saree.repository.ProductRepository;

class ProductServiceTest {

    private ProductRepository repository;
    private StorageService storageService;
    private AdminAuditLogService auditLogService;
    private ProductService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProductRepository.class);
        storageService = mock(StorageService.class);
        auditLogService = mock(AdminAuditLogService.class);
        service = new ProductService(repository, storageService, null, auditLogService);
    }

    // --- getProductById: inactive product security fix ---

    @Test
    void getProductById_returnsActiveProduct() {
        Product product = new Product();
        product.setId("1");
        product.setActive(true);
        when(repository.findById("1")).thenReturn(Optional.of(product));

        Product result = service.getProductById("1");

        assertNotNull(result);
        assertEquals("1", result.getId());
    }

    @Test
    void getProductById_returnsProductWithNullActive() {
        // Products with null active field are treated as active (legacy data)
        Product product = new Product();
        product.setId("2");
        product.setActive(null);
        when(repository.findById("2")).thenReturn(Optional.of(product));

        Product result = service.getProductById("2");

        assertNotNull(result);
        assertEquals("2", result.getId());
    }

    @Test
    void getProductById_throwsForInactiveProduct() {
        Product product = new Product();
        product.setId("3");
        product.setActive(false);
        when(repository.findById("3")).thenReturn(Optional.of(product));

        assertThrows(ProductNotFoundException.class, () -> service.getProductById("3"));
    }

    @Test
    void getProductById_throwsForNonExistentProduct() {
        when(repository.findById("999")).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () -> service.getProductById("999"));
    }

    @Test
    void getProductByIdForAdmin_returnsInactiveProduct() {
        Product product = new Product();
        product.setId("3");
        product.setActive(false);
        when(repository.findById("3")).thenReturn(Optional.of(product));

        Product result = service.getProductByIdForAdmin("3");

        assertNotNull(result);
        assertFalse(result.getActive());
    }

    @Test
    void getProductByIdForAdmin_returnsNullForNonExistent() {
        when(repository.findById("999")).thenReturn(Optional.empty());

        Product result = service.getProductByIdForAdmin("999");

        assertNull(result);
    }

    // --- Unique SKU enforcement ---

    @Test
    void createProduct_throwsForDuplicateSku() {
        Product product = new Product();
        product.setSku("SKU-001");
        when(repository.existsBySku("SKU-001")).thenReturn(true);

        assertThrows(DuplicateSkuException.class, () -> service.createProduct(product));
    }

    @Test
    void createProduct_succeedsForUniqueSku() {
        Product product = new Product();
        product.setSku("SKU-UNIQUE");
        when(repository.existsBySku("SKU-UNIQUE")).thenReturn(false);
        when(repository.save(any(Product.class))).thenReturn(product);

        Product result = service.createProduct(product);

        assertNotNull(result);
        verify(repository).save(any(Product.class));
    }

    @Test
    void updateProduct_throwsWhenSkuChangedToDuplicate() {
        Product existing = new Product();
        existing.setId("1");
        existing.setSku("SKU-OLD");
        when(repository.findById("1")).thenReturn(Optional.of(existing));

        Product update = new Product();
        update.setSku("SKU-TAKEN");
        when(repository.existsBySku("SKU-TAKEN")).thenReturn(true);

        assertThrows(DuplicateSkuException.class, () -> service.updateProduct("1", update));
    }

    @Test
    void updateProduct_allowsSameSkuOnSameProduct() {
        Product existing = new Product();
        existing.setId("1");
        existing.setSku("SKU-SAME");
        when(repository.findById("1")).thenReturn(Optional.of(existing));

        Product update = new Product();
        update.setSku("SKU-SAME");
        when(repository.save(any(Product.class))).thenReturn(update);

        Product result = service.updateProduct("1", update);

        assertNotNull(result);
        verify(repository, never()).existsBySku(anyString());
    }

    // --- Existing tests (preserved) ---

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
    void productUpdateWritesAuditOnlyAfterSuccessfulSave() {
        Product existing = new Product();
        existing.setId("1");
        existing.setSku("SKU-1");
        existing.setPrice(1000.0);
        Product update = new Product();
        update.setSku("SKU-1");
        update.setPrice(1200.0);
        when(repository.findById("1")).thenReturn(Optional.of(existing));
        when(repository.save(update)).thenReturn(update);

        service.updateProduct("1", update);

        var order = inOrder(repository, auditLogService);
        order.verify(repository).save(update);
        order.verify(auditLogService).logProductPriceChange("1", "SKU-1", 1000.0, 1200.0);
    }

    @Test
    void failedProductUpdateDoesNotWriteAudit() {
        Product existing = new Product();
        existing.setId("1");
        existing.setSku("SKU-1");
        existing.setPrice(1000.0);
        Product update = new Product();
        update.setSku("SKU-1");
        update.setPrice(1200.0);
        when(repository.findById("1")).thenReturn(Optional.of(existing));
        when(repository.save(update)).thenThrow(new IllegalStateException("database unavailable"));

        assertThrows(IllegalStateException.class, () -> service.updateProduct("1", update));

        verifyNoInteractions(auditLogService);
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
