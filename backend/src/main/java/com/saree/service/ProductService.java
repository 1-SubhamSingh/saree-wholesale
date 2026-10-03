package com.saree.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.saree.model.Product;
import com.saree.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StorageService storageService;

    public ProductService(ProductRepository productRepository, StorageService storageService) {
        this.productRepository = productRepository;
        this.storageService = storageService;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(String id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product product) {
        Product existing = productRepository.findById(id).orElse(null);
        product.setId(id);
        Product updated = productRepository.save(product);
        if (existing != null && existing.getImageUrl() != null
                && !existing.getImageUrl().equals(product.getImageUrl())) {
            storageService.delete(existing.getImageUrl());
        }
        return updated;
    }

    public void deleteProduct(String id) {
        Product existing = productRepository.findById(id).orElse(null);
        productRepository.deleteById(id);
        if (existing != null) {
            storageService.delete(existing.getImageUrl());
        }
    }
}