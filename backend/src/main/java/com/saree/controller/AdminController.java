package com.saree.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.saree.dto.DashboardStatsDto;
import com.saree.dto.EnquiryStatusUpdateDto;
import com.saree.dto.LoginRequestDto;
import com.saree.model.Enquiry;
import com.saree.model.Product;
import com.saree.security.AdminAuthService;
import com.saree.security.JwtTokenProvider;
import com.saree.service.DashboardService;
import com.saree.service.EnquiryService;
import com.saree.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProductService productService;
    private final EnquiryService enquiryService;
    private final DashboardService dashboardService;
    private final AdminAuthService adminAuthService;
    private final JwtTokenProvider jwtTokenProvider;

    public AdminController(ProductService productService,
                           EnquiryService enquiryService,
                           DashboardService dashboardService,
                           AdminAuthService adminAuthService,
                           JwtTokenProvider jwtTokenProvider) {
        this.productService = productService;
        this.enquiryService = enquiryService;
        this.dashboardService = dashboardService;
        this.adminAuthService = adminAuthService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // --- Admin Authentication ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginDto) {
        boolean authenticated = adminAuthService.authenticate(loginDto.getUsername(), loginDto.getPassword());
        if (authenticated) {
            String token = jwtTokenProvider.generateToken(loginDto.getUsername(), "ROLE_ADMIN");
            return ResponseEntity.ok(Map.of(
                "token", token,
                "username", loginDto.getUsername(),
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
    public ResponseEntity<DashboardStatsDto> getStats() {
        DashboardStatsDto stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // --- Admin Product CRUD ---
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProductsAdmin() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        if (product.getActive() == null) {
            product.setActive(true);
        }
        Product created = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // --- Admin Enquiry Management ---
    @GetMapping("/enquiries")
    public ResponseEntity<List<Enquiry>> getAllEnquiries() {
        List<Enquiry> enquiries = enquiryService.getAllEnquiries();
        return ResponseEntity.ok(enquiries);
    }

    @GetMapping("/enquiries/{id}")
    public ResponseEntity<Enquiry> getEnquiryById(@PathVariable String id) {
        Enquiry enquiry = enquiryService.getEnquiryById(id);
        if (enquiry == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(enquiry);
    }

    @PutMapping("/enquiries/{id}/status")
    public ResponseEntity<Enquiry> updateEnquiryStatus(@PathVariable String id, @Valid @RequestBody EnquiryStatusUpdateDto dto) {
        Enquiry updated = enquiryService.updateEnquiryStatus(id, dto.getStatus());
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
}
