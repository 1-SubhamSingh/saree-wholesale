package com.saree.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
@CompoundIndexes({
    @CompoundIndex(name = "active_featured_idx", def = "{'active': 1, 'featured': 1}"),
    @CompoundIndex(name = "category_active_idx", def = "{'category': 1, 'active': 1}"),
    @CompoundIndex(name = "active_updatedAt_idx", def = "{'active': 1, 'updatedAt': -1}")
})
public class Product {

    @Id
    private String id;

    @Indexed(unique = true)
    private String sku;

    private String name;

    @Indexed
    private String category;

    @Indexed
    private String fabric;

    @Indexed
    private String color;

    private Double price;
    private String priceTier;
    private String minOrder;
    private String description;
    private String sareeLength;
    private Boolean blouseIncluded;
    private String careInstructions;
    private String badge;
    private String imageUrl;
    private List<ProductVariant> variants;

    @Indexed
    private Boolean active;

    @Indexed
    private Boolean featured;

    private java.time.LocalDateTime createdAt;

    @Indexed
    private java.time.LocalDateTime updatedAt;
}