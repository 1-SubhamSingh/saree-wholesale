package com.saree.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.saree.model.Product;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByActiveTrue();
    List<Product> findByActiveTrueAndFeaturedTrue();
    long countByActiveTrue();
    long countByActiveFalse();
    boolean existsBySku(String sku);
}