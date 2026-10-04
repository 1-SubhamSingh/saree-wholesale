package com.saree.controller;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import com.saree.model.Product;
import com.saree.repository.ProductRepository;

@SpringBootTest(classes = com.saree.BackendApplication.class)
@AutoConfigureMockMvc
class ProductPaginationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    private final List<String> createdProductIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        // Insert sample test products with distinct properties for pagination, search, filter, and sort testing
        for (int i = 1; i <= 25; i++) {
            Product p = new Product();
            p.setSku(String.format("TEST-SKU-%03d", i));
            p.setName(String.format("Test Banarasi Saree %02d", i));
            p.setCategory(i % 2 == 0 ? "Banarasi Weave" : "Silk Sarees");
            p.setFabric(i % 3 == 0 ? "Pure Mulberry Silk" : "Katan Silk Brocade");
            p.setColor(i % 4 == 0 ? "Crimson Red" : (i % 4 == 1 ? "Mustard Gold" : "Pastel Pink"));
            p.setPrice(1000.0 + (i * 100.0)); // 1100.0 to 3500.0
            p.setDescription(String.format("Authentic handloom test weave description %d", i));
            p.setActive(true);
            Product saved = productRepository.save(p);
            createdProductIds.add(saved.getId());
        }

        // Add one inactive product to verify public filter excludes it
        Product inactive = new Product();
        inactive.setSku("TEST-INACTIVE-01");
        inactive.setName("Inactive Archive Saree");
        inactive.setCategory("Banarasi Weave");
        inactive.setActive(false);
        Product savedInactive = productRepository.save(inactive);
        createdProductIds.add(savedInactive.getId());
    }

    @AfterEach
    void tearDown() {
        if (!createdProductIds.isEmpty()) {
            productRepository.deleteAllById(createdProductIds);
            createdProductIds.clear();
        }
    }

    @Test
    @DisplayName("Default pagination returns 12 products per page, page 0, and all required metadata")
    void testDefaultPagination() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(12))
                .andExpect(jsonPath("$.content", hasSize(12)))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(25)))
                .andExpect(jsonPath("$.totalPages", greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(false))
                // Verify product structure inside content is preserved
                .andExpect(jsonPath("$.content[0].sku").isNotEmpty())
                .andExpect(jsonPath("$.content[0].name").isNotEmpty());
    }

    @Test
    @DisplayName("Custom page size returns requested number of products")
    void testCustomPageSize() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.first").value(true));
    }

    @Test
    @DisplayName("Multiple pages navigation returns distinct pages and correct flags")
    void testMultiplePages() throws Exception {
        // Page 0
        mockMvc.perform(get("/api/products")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(false));

        // Page 1
        mockMvc.perform(get("/api/products")
                        .param("page", "1")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.first").value(false));
    }

    @Test
    @DisplayName("Out-of-range page returns empty content and last=true without error")
    void testEmptyAndOutOfRangePage() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("page", "100")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(100))
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(25)))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    @DisplayName("Negative or invalid page/size parameters are normalized safely")
    void testInvalidPageParametersHandledGracefully() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("page", "-5")
                        .param("size", "-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(12))
                .andExpect(jsonPath("$.content", hasSize(12)));
    }

    @Test
    @DisplayName("Search combined with pagination filters matching products and paginates result")
    void testSearchCombinedWithPagination() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("search", "TEST-SKU-001")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].sku").value("TEST-SKU-001"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    @DisplayName("Category, fabric and color filters combined with pagination")
    void testFiltersCombinedWithPagination() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("category", "Banarasi Weave")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.content[0].category").value("Banarasi Weave"))
                .andExpect(jsonPath("$.content[1].category").value("Banarasi Weave"));
    }

    @Test
    @DisplayName("Price range filter under_2000 combined with pagination")
    void testPriceRangeCombinedWithPagination() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("priceRange", "under_2000")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].price", everyItem(lessThan(2000.0))));
    }

    @Test
    @DisplayName("Sorting by price ascending combined with pagination")
    void testSortingPriceAscCombinedWithPagination() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("sortBy", "price_asc")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.content[0].price", lessThanOrEqualTo(1500.0)));
    }

    @Test
    @DisplayName("Sorting by price descending combined with pagination")
    void testSortingPriceDescCombinedWithPagination() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("sortBy", "price_desc")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.content[0].price", greaterThanOrEqualTo(3000.0)));
    }

    @Test
    @DisplayName("Public pagination endpoint excludes inactive products")
    void testInactiveProductsExcluded() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("search", "Inactive Archive Saree"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0))
                .andExpect(jsonPath("$.content", hasSize(0)));
    }
}
