package com.saree.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDto {

    @NotBlank(message = "SKU is required")
    @Size(min = 1, max = 50, message = "SKU must be between 1 and 50 characters")
    private String sku;

    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 200, message = "Name must be between 1 and 200 characters")
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must be at most 100 characters")
    private String category;

    @NotBlank(message = "Fabric is required")
    @Size(max = 100, message = "Fabric must be at most 100 characters")
    private String fabric;

    @NotBlank(message = "Color is required")
    @Size(max = 100, message = "Color must be at most 100 characters")
    private String color;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be zero or positive")
    private Double price;

    private String priceTier;

    @Size(max = 100, message = "Minimum order must be at most 100 characters")
    private String minOrder;

    @Size(max = 2000, message = "Description must be at most 2000 characters")
    private String description;

    @Size(max = 100, message = "Saree length must be at most 100 characters")
    private String sareeLength;

    private Boolean blouseIncluded;

    @Size(max = 500, message = "Care instructions must be at most 500 characters")
    private String careInstructions;

    @Size(max = 50, message = "Badge must be at most 50 characters")
    private String badge;

    private String imageUrl;

    @Valid
    @Size(max = 50, message = "At most 50 variants allowed")
    private List<ProductVariantDto> variants;

    private Boolean active;
    private Boolean featured;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductVariantDto {

        @NotBlank(message = "Variant name is required")
        @Size(max = 100, message = "Variant name must be at most 100 characters")
        private String name;

        @Size(max = 20, message = "Variant hex must be at most 20 characters")
        private String hex;
    }
}
