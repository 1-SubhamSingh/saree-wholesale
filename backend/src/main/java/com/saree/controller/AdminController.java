package com.saree.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.saree.dto.DashboardStatsDto;
import com.saree.dto.EnquiryStatusUpdateDto;
import com.saree.dto.LoginRequestDto;
import com.saree.model.Enquiry;
import com.saree.model.Product;
import com.saree.service.DashboardService;
import com.saree.service.EnquiryService;
import com.saree.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final ProductService productService;
    private final EnquiryService enquiryService;
    private final DashboardService dashboardService;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    // Hardened static mock bearer token for admin session verification
    private static final String ADMIN_BEARER_TOKEN = "saree_wholesale_admin_token_jwt_secure_session_2026";

    public AdminController(ProductService productService, EnquiryService enquiryService, DashboardService dashboardService) {
        this.productService = productService;
        this.enquiryService = enquiryService;
        this.dashboardService = dashboardService;
    }

    private boolean isAuthorized(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring(7);
        return ADMIN_BEARER_TOKEN.equals(token);
    }

    // --- Admin Authentication ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginDto) {
        if (adminUsername.equals(loginDto.getUsername()) && adminPassword.equals(loginDto.getPassword())) {
            return ResponseEntity.ok(Map.of(
                "token", ADMIN_BEARER_TOKEN,
                "username", adminUsername,
                "role", "ROLE_ADMIN",
                "message", "Authentication successful"
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
            "message", "Invalid username or password"
        ));
    }

    // --- Dashboard Statistics ---
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized admin access"));
        }
        DashboardStatsDto stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // --- Admin Product CRUD ---
    @GetMapping("/products")
    public ResponseEntity<?> getAllProductsAdmin(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized admin access"));
        }
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Product product) {
        if (!isAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized admin access"));
        }
        if (product.getActive() == null) {
            product.setActive(true);
        }
        Product created = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id,
            @RequestBody Product product) {
        if (!isAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized admin access"));
        }
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        if (!isAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized admin access"));
        }
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // --- Admin Enquiry Management ---
    @GetMapping("/enquiries")
    public ResponseEntity<?> getAllEnquiries(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized admin access"));
        }
        List<Enquiry> enquiries = enquiryService.getAllEnquiries();
        return ResponseEntity.ok(enquiries);
    }

    @GetMapping("/enquiries/{id}")
    public ResponseEntity<?> getEnquiryById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        if (!isAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized admin access"));
        }
        Enquiry enquiry = enquiryService.getEnquiryById(id);
        if (enquiry == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(enquiry);
    }

    @PutMapping("/enquiries/{id}/status")
    public ResponseEntity<?> updateEnquiryStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id,
            @Valid @RequestBody EnquiryStatusUpdateDto dto) {
        if (!isAuthorized(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized admin access"));
        }
        Enquiry updated = enquiryService.updateEnquiryStatus(id, dto.getStatus());
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
}
