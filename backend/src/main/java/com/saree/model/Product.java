package com.saree.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String sku;
    private String name;
    private String category;
    private String fabric;
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
    private Boolean active;
}