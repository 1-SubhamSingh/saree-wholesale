package com.saree.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

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
    void publicEndpoints_products_isAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
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
}
