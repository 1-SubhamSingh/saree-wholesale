package com.saree.service;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.regex.Pattern;

import com.saree.dto.ProductFilterOptions;
import com.saree.exception.DuplicateSkuException;
import com.saree.exception.ProductNotFoundException;

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
    private final AdminAuditLogService auditLogService;

    @Autowired
    public ProductService(ProductRepository productRepository,
                          StorageService storageService,
                          MongoTemplate mongoTemplate,
                          @Autowired(required = false) AdminAuditLogService auditLogService) {
        this.productRepository = productRepository;
        this.storageService = storageService;
        this.mongoTemplate = mongoTemplate;
        this.auditLogService = auditLogService;
    }

    public ProductService(ProductRepository productRepository,
                          StorageService storageService,
                          MongoTemplate mongoTemplate) {
        this(productRepository, storageService, mongoTemplate, null);
    }

    public ProductService(ProductRepository productRepository, StorageService storageService) {
        this(productRepository, storageService, null, null);
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
            return Sort.by(
                    Sort.Order.desc("featured"),
                    Sort.Order.desc("updatedAt"),
                    Sort.Order.desc("createdAt"),
                    Sort.Order.desc("id")
            );
        }

        String sortKey = sortBy.trim().toLowerCase();
        return switch (sortKey) {
            case "price_asc", "price,asc", "price-low" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc", "price,desc", "price-high" -> Sort.by(Sort.Direction.DESC, "price");
            case "name_asc", "name,asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "name_desc", "name,desc" -> Sort.by(Sort.Direction.DESC, "name");
            default -> Sort.by(
                    Sort.Order.desc("featured"),
                    Sort.Order.desc("updatedAt"),
                    Sort.Order.desc("createdAt"),
                    Sort.Order.desc("id")
            );
        };
    }

    public List<Product> getFeaturedProducts() {
        if (mongoTemplate == null) {
            List<Product> list = productRepository.findByActiveTrueAndFeaturedTrue();
            if (list == null || list.isEmpty()) {
                return productRepository.findByActiveTrue();
            }
            return list;
        }

        Query query = new Query(Criteria.where("active").ne(false).and("featured").is(true));
        query.with(Sort.by(Sort.Direction.DESC, "updatedAt", "createdAt", "id"));
        List<Product> featured = mongoTemplate.find(query, Product.class);

        // Fallback to top active products if none are marked featured yet
        if (featured.isEmpty()) {
            Query fallbackQuery = new Query(Criteria.where("active").ne(false));
            fallbackQuery.with(Sort.by(Sort.Direction.DESC, "id")).limit(8);
            return mongoTemplate.find(fallbackQuery, Product.class);
        }

        return featured;
    }

    public Page<Product> getAdminProducts(
            int page,
            int size,
            String search,
            String category,
            Boolean active,
            String sortBy) {

        int normalizedPage = Math.max(0, page);
        int normalizedSize = size <= 0 ? 10 : Math.min(size, 100);

        Sort sort = resolveAdminSort(sortBy);
        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, sort);

        if (mongoTemplate == null) {
            return productRepository.findAll(pageable);
        }

        List<Criteria> criteriaList = new ArrayList<>();

        if (active != null) {
            if (active) {
                criteriaList.add(Criteria.where("active").ne(false));
            } else {
                criteriaList.add(Criteria.where("active").is(false));
            }
        }

        if (search != null && !search.trim().isEmpty()) {
            String trimmed = search.trim();
            Pattern pattern = Pattern.compile(Pattern.quote(trimmed), Pattern.CASE_INSENSITIVE);
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("name").regex(pattern),
                    Criteria.where("sku").regex(pattern)
            ));
        }

        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all") && !category.equalsIgnoreCase("All Categories")) {
            criteriaList.add(Criteria.where("category").regex("^" + Pattern.quote(category.trim()) + "$", "i"));
        }

        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            if (criteriaList.size() == 1) {
                query.addCriteria(criteriaList.get(0));
            } else {
                query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
            }
        }

        long totalElements = mongoTemplate.count(query, Product.class);
        query.with(pageable);
        List<Product> content = mongoTemplate.find(query, Product.class);

        return new PageImpl<>(content, pageable, totalElements);
    }

    private Sort resolveAdminSort(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty() || "newest".equalsIgnoreCase(sortBy.trim())) {
            return Sort.by(Sort.Direction.DESC, "updatedAt", "createdAt", "id");
        }
        String sortKey = sortBy.trim().toLowerCase();
        return switch (sortKey) {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt", "id");
            case "price_asc", "price,asc", "price-low" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc", "price,desc", "price-high" -> Sort.by(Sort.Direction.DESC, "price");
            case "name_asc", "name,asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "name_desc", "name,desc" -> Sort.by(Sort.Direction.DESC, "name");
            case "featured" -> Sort.by(
                    Sort.Order.desc("featured"),
                    Sort.Order.desc("updatedAt"),
                    Sort.Order.desc("id")
            );
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
        TreeSet<String> values = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        mongoTemplate.query(Product.class)
                .distinct(field)
                .matching(query)
                .as(String.class)
                .all()
                .stream()
                .filter(value -> value != null && !value.trim().isEmpty())
                .forEach(values::add);
        return values.stream().toList();
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
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            throw new ProductNotFoundException(id);
        }
        if (product.getActive() != null && !product.getActive()) {
            throw new ProductNotFoundException(id);
        }
        return product;
    }

    /**
     * Admin variant: returns the product regardless of active status.
     */
    public Product getProductByIdForAdmin(String id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product createProduct(Product product) {
        if (product.getSku() != null && productRepository.existsBySku(product.getSku())) {
            throw new DuplicateSkuException(product.getSku());
        }
        if (product.getActive() == null) {
            product.setActive(true);
        }
        if (product.getFeatured() == null) {
            product.setFeatured(false);
        }
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (product.getCreatedAt() == null) {
            product.setCreatedAt(now);
        }
        product.setUpdatedAt(now);
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product product) {
        Product existing = productRepository.findById(id).orElse(null);
        // Check SKU uniqueness if SKU is being changed
        if (product.getSku() != null && existing != null
                && !product.getSku().equals(existing.getSku())
                && productRepository.existsBySku(product.getSku())) {
            throw new DuplicateSkuException(product.getSku());
        }
        product.setId(id);
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (existing != null) {
            if (product.getCreatedAt() == null) {
                product.setCreatedAt(existing.getCreatedAt() != null ? existing.getCreatedAt() : now);
            }
            if (product.getFeatured() == null) {
                product.setFeatured(existing.getFeatured() != null ? existing.getFeatured() : false);
            }
            if (product.getActive() == null) {
                product.setActive(existing.getActive() != null ? existing.getActive() : true);
            }
        } else if (product.getCreatedAt() == null) {
            product.setCreatedAt(now);
        }
        if (existing != null && product != null && auditLogService != null) {
            // Price change audit
            if (existing.getPrice() != null && product.getPrice() != null
                    && !existing.getPrice().equals(product.getPrice())) {
                auditLogService.logProductPriceChange(id, product.getSku(), existing.getPrice(), product.getPrice());
            }
            // Deactivation audit
            if (!Boolean.FALSE.equals(existing.getActive()) && Boolean.FALSE.equals(product.getActive())) {
                auditLogService.logProductDeactivation(id, product.getSku(), existing.getActive(), false);
            }
        }
        product.setUpdatedAt(now);
        Product updated = productRepository.save(product);
        if (existing != null && existing.getImageUrl() != null
                && !existing.getImageUrl().equals(product.getImageUrl())) {
            storageService.delete(existing.getImageUrl());
        }
        return updated;
    }

    public Product toggleFeatured(String id, Boolean featured) {
        Product existing = productRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        boolean newFeatured = (featured != null) ? featured : (existing.getFeatured() == null || !existing.getFeatured());
        existing.setFeatured(newFeatured);
        existing.setUpdatedAt(java.time.LocalDateTime.now());
        return productRepository.save(existing);
    }

    public Product toggleActive(String id, Boolean active) {
        Product existing = productRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        boolean newActive = (active != null) ? active : (existing.getActive() == null || !existing.getActive());
        if (auditLogService != null && !Boolean.FALSE.equals(existing.getActive()) && !newActive) {
            auditLogService.logProductDeactivation(id, existing.getSku(), existing.getActive(), false);
        }
        existing.setActive(newActive);
        existing.setUpdatedAt(java.time.LocalDateTime.now());
        return productRepository.save(existing);
    }

    public void deleteProduct(String id) {
        Product existing = productRepository.findById(id).orElse(null);
        productRepository.deleteById(id);
        if (existing != null) {
            if (auditLogService != null) {
                auditLogService.logProductDeletion(id, existing.getSku(), existing.getName(), existing.getPrice());
            }
            storageService.delete(existing.getImageUrl());
        }
    }
}