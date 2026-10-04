package com.saree.service;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.regex.Pattern;

import com.saree.dto.ProductFilterOptions;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.saree.model.Product;
import com.saree.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StorageService storageService;
    private final MongoTemplate mongoTemplate;

    @Autowired
    public ProductService(ProductRepository productRepository,
                          StorageService storageService,
                          MongoTemplate mongoTemplate) {
        this.productRepository = productRepository;
        this.storageService = storageService;
        this.mongoTemplate = mongoTemplate;
    }

    public ProductService(ProductRepository productRepository, StorageService storageService) {
        this(productRepository, storageService, null);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Page<Product> getProducts(
            int page,
            int size,
            String search,
            String category,
            String fabric,
            String color,
            Double minPrice,
            Double maxPrice,
            String priceRange,
            String sortBy) {

        int normalizedPage = Math.max(0, page);
        int normalizedSize = size <= 0 ? 12 : Math.min(size, 100);

        Sort sort = resolveSort(sortBy);
        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, sort);

        if (mongoTemplate == null) {
            return productRepository.findAll(pageable);
        }

        List<Criteria> criteriaList = new ArrayList<>();

        // Public catalogue only shows active products
        criteriaList.add(Criteria.where("active").ne(false));

        // Search query across name, sku, category, fabric, description
        if (search != null && !search.trim().isEmpty()) {
            String trimmed = search.trim();
            Pattern pattern = Pattern.compile(Pattern.quote(trimmed), Pattern.CASE_INSENSITIVE);
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("name").regex(pattern),
                    Criteria.where("sku").regex(pattern),
                    Criteria.where("category").regex(pattern),
                    Criteria.where("fabric").regex(pattern),
                    Criteria.where("description").regex(pattern)
            ));
        }

        // Category filter
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All Categories")) {
            criteriaList.add(Criteria.where("category").regex("^" + Pattern.quote(category.trim()) + "$", "i"));
        }

        // Fabric filter
        if (fabric != null && !fabric.trim().isEmpty() && !fabric.equalsIgnoreCase("All Fabrics")) {
            criteriaList.add(Criteria.where("fabric").regex("^" + Pattern.quote(fabric.trim()) + "$", "i"));
        }

        // Color filter
        if (color != null && !color.trim().isEmpty() && !color.equalsIgnoreCase("All Colors")) {
            criteriaList.add(Criteria.where("color").regex("^" + Pattern.quote(color.trim()) + "$", "i"));
        }

        // Price range filter
        Double effectiveMin = minPrice;
        Double effectiveMax = maxPrice;

        if (priceRange != null && !priceRange.trim().isEmpty() && !priceRange.equalsIgnoreCase("all")) {
            String normalizedRange = priceRange.trim().toLowerCase();
            if ("under_2000".equals(normalizedRange)) {
                if (effectiveMax == null || 2000.0 < effectiveMax) {
                    effectiveMax = 1999.999;
                }
            } else if ("2000_3500".equals(normalizedRange)) {
                if (effectiveMin == null || 2000.0 > effectiveMin) {
                    effectiveMin = 2000.0;
                }
                if (effectiveMax == null || 3500.0 < effectiveMax) {
                    effectiveMax = 3500.0;
                }
            } else if ("above_3500".equals(normalizedRange)) {
                if (effectiveMin == null || 3500.0 > effectiveMin) {
                    effectiveMin = 3500.001;
                }
            }
        }

        if (effectiveMin != null && effectiveMax != null) {
            criteriaList.add(Criteria.where("price").gte(effectiveMin).lte(effectiveMax));
        } else if (effectiveMin != null) {
            criteriaList.add(Criteria.where("price").gte(effectiveMin));
        } else if (effectiveMax != null) {
            criteriaList.add(Criteria.where("price").lte(effectiveMax));
        }

        Query query = new Query();
        if (criteriaList.size() == 1) {
            query.addCriteria(criteriaList.get(0));
        } else {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long totalElements = mongoTemplate.count(query, Product.class);
        query.with(pageable);
        List<Product> content = mongoTemplate.find(query, Product.class);

        return new PageImpl<>(content, pageable, totalElements);
    }

    private Sort resolveSort(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty() || "featured".equalsIgnoreCase(sortBy.trim())) {
            return Sort.by(Sort.Direction.DESC, "id");
        }

        String sortKey = sortBy.trim().toLowerCase();
        return switch (sortKey) {
            case "price_asc", "price,asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc", "price,desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "name_asc", "name,asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "name_desc", "name,desc" -> Sort.by(Sort.Direction.DESC, "name");
            default -> Sort.by(Sort.Direction.DESC, "id");
        };
    }

    public List<Product> getActiveProducts() {
        if (mongoTemplate == null) {
            return productRepository.findByActiveTrue();
        }

        Query query = new Query(Criteria.where("active").ne(false));
        return mongoTemplate.find(query, Product.class);
    }

    public ProductFilterOptions getFilterOptions() {
        if (mongoTemplate == null) {
            List<Product> products = productRepository.findByActiveTrue();
            return new ProductFilterOptions(
                    collectValues(products, Product::getCategory),
                    collectValues(products, Product::getFabric),
                    collectValues(products, Product::getColor)
            );
        }

        Query query = new Query(Criteria.where("active").ne(false));

        return new ProductFilterOptions(
                distinctValues("category", query),
                distinctValues("fabric", query),
                distinctValues("color", query)
        );
    }

    private List<String> distinctValues(String field, Query query) {
        return new TreeSet<String>(String.CASE_INSENSITIVE_ORDER) {{
            addAll(mongoTemplate.query(Product.class)
                    .distinct(field)
                    .matching(query)
                    .as(String.class)
                    .all());
            removeIf(value -> value == null || value.trim().isEmpty());
        }}.stream().toList();
    }

    private List<String> collectValues(List<Product> products, Function<Product, String> getter) {
        TreeSet<String> values = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        products.stream()
                .map(getter)
                .filter(value -> value != null && !value.trim().isEmpty())
                .forEach(values::add);
        return values.stream().toList();
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