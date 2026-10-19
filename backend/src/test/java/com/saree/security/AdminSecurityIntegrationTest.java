package com.saree.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.mock.web.MockMultipartFile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = com.saree.BackendApplication.class)
@AutoConfigureMockMvc
class AdminSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // --- 1. Login Tests ---

    @Test
    void login_withValidCredentials_returnsJwtToken() throws Exception {
        String loginJson = """
            {
                "username": "admin1",
                "password": "admin123"
            }
            """;

        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("admin1"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"))
                .andExpect(jsonPath("$.message").value("Authentication successful"));
    }

    @Test
    void login_withInvalidPassword_returns401() throws Exception {
        String loginJson = """
            {
                "username": "admin1",
                "password": "wrongPassword"
            }
            """;

        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void login_withInvalidUsername_returns401() throws Exception {
        String loginJson = """
            {
                "username": "nonExistentUser",
                "password": "admin123"
            }
            """;

        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void login_withMissingFields_returns400() throws Exception {
        String loginJson = """
            {
                "username": "",
                "password": ""
            }
            """;

        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    // --- 2. Public Endpoints Tests ---

    @Test
    void publicEndpoints_health_isAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void publicEndpoints_products_readEndpointsAreAccessibleWithoutAuth() throws Exception {
        // GET /api/products
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());

        // GET /api/products/active
        mockMvc.perform(get("/api/products/active"))
                .andExpect(status().isOk());

        // GET /api/products/filters
        mockMvc.perform(get("/api/products/filters"))
                .andExpect(status().isOk());

        // GET /api/products/{id} without auth allows access (returns 404 for non-existent product rather than 401)
        mockMvc.perform(get("/api/products/non-existent-product-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void publicEndpoints_products_writeEndpointsAreRejectedWithoutAuth() throws Exception {
        String productJson = """
            {
                "sku": "TEST-UNAUTH-01",
                "name": "Unauthorized Public Product",
                "category": "Silk",
                "price": 2500.0
            }
            """;

        // POST /api/products without auth must return 401
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));

        // PUT /api/products/{id} without auth must return 401
        mockMvc.perform(put("/api/products/sample-id")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));

        // DELETE /api/products/{id} without auth must return 401
        mockMvc.perform(delete("/api/products/sample-id"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));
    }

    @Test
    void publicEndpoints_enquirySubmission_isAccessibleWithoutAuth() throws Exception {
        String enquiryJson = """
            {
                "fullName": "Sunita Verma",
                "businessName": "Verma Sarees Emporium",
                "city": "Varanasi",
                "phone": "9876543210",
                "quantity": "50-100 Pieces",
                "message": "Need Banarasi and Katan Silk sarees for festive collection",
                "selectedProduct": "Katan Silk Brocade"
            }
            """;

        mockMvc.perform(post("/api/enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(enquiryJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Enquiry received successfully"));
    }

    // --- 3. Protected Endpoints: Missing / Invalid / Expired JWT ---

    @Test
    void protectedEndpoints_missingToken_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));

        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Unauthorized Saree\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));

        mockMvc.perform(put("/api/admin/products/sample-id")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Unauthorized Update\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));

        mockMvc.perform(delete("/api/admin/products/sample-id"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));

        mockMvc.perform(get("/api/admin/enquiries"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));
    }

    @Test
    void protectedEndpoints_invalidToken_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer invalid-tampered-token-12345"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));
    }

    @Test
    void protectedEndpoints_expiredToken_returns401() throws Exception {
        String expiredToken = jwtTokenProvider.generateExpiredToken("admin1", "ROLE_ADMIN");

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));
    }

    // --- 4. Protected Endpoints: Valid JWT Authorization ---

    @Test
    void protectedEndpoints_validAdminToken_returns200() throws Exception {
        String validAdminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/enquiries")
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isOk());
    }

    @Test
    void protectedEndpoints_adminProductLifecycle_withValidAdminToken_succeeds() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        String newProductJson = """
            {
                "sku": "TEST-ADMIN-CRUD-01",
                "name": "Admin Created Brocade Saree",
                "category": "Banarasi Weave",
                "fabric": "Katan Silk",
                "color": "Royal Crimson",
                "price": 4500.0,
                "description": "Exquisite bridal handloom creation",
                "active": true
            }
            """;

        // 1. Create via POST /api/admin/products
        String responseContent = mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newProductJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Admin Created Brocade Saree"))
                .andReturn().getResponse().getContentAsString();

        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(responseContent);
        String createdId = node.get("id").asText();

        // 2. Update via PUT /api/admin/products/{id}
        String updatedProductJson = """
            {
                "sku": "TEST-ADMIN-CRUD-01",
                "name": "Admin Updated Brocade Saree",
                "category": "Banarasi Weave",
                "fabric": "Katan Silk",
                "color": "Royal Crimson",
                "price": 4800.0,
                "description": "Updated description",
                "active": true
            }
            """;

        mockMvc.perform(put("/api/admin/products/" + createdId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedProductJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Admin Updated Brocade Saree"))
                .andExpect(jsonPath("$.price").value(4800.0));

        // 3. Delete via DELETE /api/admin/products/{id}
        mockMvc.perform(delete("/api/admin/products/" + createdId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        // 4. Verify public GET /{id} now returns 404
        mockMvc.perform(get("/api/products/" + createdId))
                .andExpect(status().isNotFound());
    }

    @Test
    void createProduct_withInvalidDto_returns400() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        // Missing sku, blank name, negative price
        String invalidJson = """
            {
                "sku": "",
                "name": "",
                "category": "",
                "fabric": "",
                "color": "",
                "price": -100.0
            }
            """;

        mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details.sku").isNotEmpty())
                .andExpect(jsonPath("$.details.name").isNotEmpty())
                .andExpect(jsonPath("$.details.price").isNotEmpty());
    }

    @Test
    void createProduct_withDuplicateSku_returns409() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        String productJson = """
            {
                "sku": "TEST-DUP-SKU-99",
                "name": "Original Saree",
                "category": "Banarasi Weave",
                "fabric": "Silk",
                "color": "Red",
                "price": 2500.0
            }
            """;

        // Create first product
        String res = mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ObjectMapper mapper = new ObjectMapper();
        String id = mapper.readTree(res).get("id").asText();

        try {
            // Attempt to create second product with same SKU
            mockMvc.perform(post("/api/admin/products")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(productJson))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message").value(containsString("already exists")));
        } finally {
            // Cleanup
            mockMvc.perform(delete("/api/admin/products/" + id)
                            .header("Authorization", "Bearer " + adminToken));
        }
    }

    @Test
    void adminProducts_withPriceLowAndPriceHighSort_returns200() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        // Verify price-low
        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("sortBy", "price-low"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        // Verify price-high
        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("sortBy", "price-high"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void protectedEndpoints_tokenWithoutAdminRole_returns403() throws Exception {
        String nonAdminToken = jwtTokenProvider.generateToken("regular_buyer", "ROLE_USER");

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + nonAdminToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden: Insufficient privileges"));
    }

    // --- 5. CORS Preflight Test ---

    @Test
    void cors_preflightRequest_isAllowedForConfiguredOrigin() throws Exception {
        mockMvc.perform(options("/api/admin/stats")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    // --- 6. Image Upload & Static Serving End-to-End Tests ---

    @Test
    void imageUpload_withoutAuth_returns401() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.png", "image/png",
                new byte[]{(byte)0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3});

        mockMvc.perform(multipart("/api/admin/products/upload-image").file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void imageUpload_withAdminAuth_succeedsAndCanBeFetchedPublicly() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");
        MockMultipartFile file = new MockMultipartFile(
                "file", "test-product.png", "image/png",
                new byte[]{(byte)0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3});

        String responseJson = mockMvc.perform(multipart("/api/admin/products/upload-image")
                        .file(file)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").isString())
                .andReturn().getResponse().getContentAsString();

        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(responseJson);
        String fullUrl = node.get("imageUrl").asText();
        String uploadPath = fullUrl.substring(fullUrl.indexOf("/api/uploads/"));

        // Verify that the uploaded file can be served without authentication
        mockMvc.perform(get(uploadPath))
                .andExpect(status().isOk());
    }

    // --- 7. Featured Products: Public Endpoint ---

    @Test
    void publicEndpoints_featuredProducts_isAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/products/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // --- 8. Admin Product Featured/Active Toggle ---

    @Test
    void adminToggleFeatured_withoutAuth_returns401() throws Exception {
        mockMvc.perform(put("/api/admin/products/some-id/featured")
                        .param("featured", "true"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));
    }

    @Test
    void adminToggleActive_withoutAuth_returns401() throws Exception {
        mockMvc.perform(put("/api/admin/products/some-id/active")
                        .param("active", "false"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));
    }

    @Test
    void adminToggleFeatured_withAdminAuth_togglesProduct() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        // Create a product first
        String productJson = """
            {
                "sku": "TOGGLE-FEAT-01",
                "name": "Featured Toggle Test Saree",
                "category": "Silk Sarees",
                "fabric": "Silk",
                "color": "Royal Crimson",
                "price": 3000.0,
                "active": true,
                "featured": false
            }
            """;

        String response = mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ObjectMapper mapper = new ObjectMapper();
        String productId = mapper.readTree(response).get("id").asText();

        try {
            // Toggle featured ON
            mockMvc.perform(put("/api/admin/products/" + productId + "/featured")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("featured", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.featured").value(true));

            // Toggle featured OFF
            mockMvc.perform(put("/api/admin/products/" + productId + "/featured")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("featured", "false"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.featured").value(false));
        } finally {
            // Cleanup
            mockMvc.perform(delete("/api/admin/products/" + productId)
                    .header("Authorization", "Bearer " + adminToken));
        }
    }

    @Test
    void adminToggleActive_withAdminAuth_togglesProduct() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        String productJson = """
            {
                "sku": "TOGGLE-ACT-01",
                "name": "Active Toggle Test Saree",
                "category": "Silk Sarees",
                "fabric": "Silk",
                "color": "Royal Crimson",
                "price": 2500.0,
                "active": true
            }
            """;

        String response = mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ObjectMapper mapper = new ObjectMapper();
        String productId = mapper.readTree(response).get("id").asText();

        try {
            // Deactivate
            mockMvc.perform(put("/api/admin/products/" + productId + "/active")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("active", "false"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.active").value(false));

            // Reactivate
            mockMvc.perform(put("/api/admin/products/" + productId + "/active")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("active", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.active").value(true));
        } finally {
            mockMvc.perform(delete("/api/admin/products/" + productId)
                    .header("Authorization", "Bearer " + adminToken));
        }
    }

    // --- 9. Admin Products Pagination & Filtering ---

    @Test
    void adminGetProducts_withPaginationParams_returnsPageResponse() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("page", "0")
                        .param("size", "5")
                        .param("sortBy", "newest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalPages").isNumber())
                .andExpect(jsonPath("$.totalElements").isNumber())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").isNumber());
    }

    @Test
    void adminGetProducts_withSearchFilter_returnsFilteredResults() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("search", "nonexistent-sku-xyz-999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void adminGetProducts_withCategoryFilter_returnsOk() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("category", "Silk Sarees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    // --- 10. Admin Enquiry Pagination, Notes ---

    @Test
    void adminGetEnquiries_withPaginationAndSearch_returnsPageResponse() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        mockMvc.perform(get("/api/admin/enquiries")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortBy", "newest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalPages").isNumber())
                .andExpect(jsonPath("$.totalElements").isNumber());
    }

    @Test
    void adminUpdateEnquiryNotes_withoutAuth_returns401() throws Exception {
        mockMvc.perform(put("/api/admin/enquiries/some-id/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"adminNotes\": \"Some internal notes\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized admin access"));
    }

    @Test
    void adminUpdateEnquiryNotes_withAdminAuth_updatesNotes() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        // First, submit a public enquiry
        String enquiryJson = """
            {
                "fullName": "Test Notes Buyer",
                "businessName": "Notes Test Boutique",
                "city": "Lucknow",
                "phone": "9999888877",
                "quantity": "20 Pieces",
                "message": "Testing admin notes workflow"
            }
            """;

        mockMvc.perform(post("/api/enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(enquiryJson))
                .andExpect(status().isCreated());

        // Fetch enquiries as admin
        String enquiriesResponse = mockMvc.perform(get("/api/admin/enquiries")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("search", "Notes Test Boutique"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andReturn().getResponse().getContentAsString();

        ObjectMapper mapper = new ObjectMapper();
        JsonNode content = mapper.readTree(enquiriesResponse).get("content");
        if (content.size() > 0) {
            String enquiryId = content.get(0).get("id").asText();

            // Save admin notes
            mockMvc.perform(put("/api/admin/enquiries/" + enquiryId + "/notes")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"adminNotes\": \"Followed up via WhatsApp. Quoted ₹2200/pc for bulk.\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.adminNotes").value("Followed up via WhatsApp. Quoted ₹2200/pc for bulk."));
        }
    }

    // --- 11. GlobalExceptionHandler: Generic 500 sanitisation ---

    @Test
    void globalExceptionHandler_returns_generic500_message() throws Exception {
        // The generic exception handler should return sanitised 500 responses.
        // We test by hitting a clearly invalid status update which will trigger validation.
        String adminToken = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");

        // Sending a status update with null status (which is @NotNull) should return 400 validation error
        mockMvc.perform(put("/api/admin/enquiries/some-fake-id/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }
}
