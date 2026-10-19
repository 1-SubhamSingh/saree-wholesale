package com.saree.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.saree.dto.DashboardStatsDto;
import com.saree.dto.EnquiryStatusUpdateDto;
import com.saree.dto.ProductRequestDto;
import com.saree.model.Enquiry;
import com.saree.model.Product;
import com.saree.model.ProductVariant;
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
    public ResponseEntity<?> login(@Valid @RequestBody com.saree.dto.LoginRequestDto loginDto) {
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
    public ResponseEntity<com.saree.dto.PageResponse<Product>> getAdminProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String sortBy) {
        org.springframework.data.domain.Page<Product> productPage =
                productService.getAdminProducts(page, size, search, category, active, sortBy);
        return ResponseEntity.ok(com.saree.dto.PageResponse.from(productPage));
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequestDto dto) {
        Product product = mapDtoToProduct(dto);
        if (product.getActive() == null) {
            product.setActive(true);
        }
        Product created = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id,
                                                 @Valid @RequestBody ProductRequestDto dto) {
        Product product = mapDtoToProduct(dto);
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/products/{id}/featured")
    public ResponseEntity<Product> toggleFeatured(
            @PathVariable String id,
            @RequestParam(required = false) Boolean featured) {
        Product updated = productService.toggleFeatured(id, featured);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/products/{id}/active")
    public ResponseEntity<Product> toggleActive(
            @PathVariable String id,
            @RequestParam(required = false) Boolean active) {
        Product updated = productService.toggleActive(id, active);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // --- Admin Enquiry Management ---
    @GetMapping("/enquiries")
    public ResponseEntity<com.saree.dto.PageResponse<Enquiry>> getEnquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) com.saree.model.EnquiryStatus status,
            @RequestParam(required = false) String sortBy) {
        org.springframework.data.domain.Page<Enquiry> enquiryPage =
                enquiryService.getEnquiries(page, size, search, status, sortBy);
        return ResponseEntity.ok(com.saree.dto.PageResponse.from(enquiryPage));
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
    public ResponseEntity<Enquiry> updateEnquiryStatus(
            @PathVariable String id,
            @Valid @RequestBody EnquiryStatusUpdateDto dto) {
        Enquiry updated = enquiryService.updateEnquiryStatus(id, dto.getStatus(), dto.getAdminNotes());
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/enquiries/{id}/notes")
    public ResponseEntity<Enquiry> updateEnquiryNotes(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String notes = body != null ? body.get("adminNotes") : null;
        Enquiry updated = enquiryService.updateEnquiryNotes(id, notes);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // --- DTO to Entity Mapping ---
    private Product mapDtoToProduct(ProductRequestDto dto) {
        Product product = new Product();
        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setFabric(dto.getFabric());
        product.setColor(dto.getColor());
        product.setPrice(dto.getPrice());
        product.setPriceTier(dto.getPriceTier());
        product.setMinOrder(dto.getMinOrder());
        product.setDescription(dto.getDescription());
        product.setSareeLength(dto.getSareeLength());
        product.setBlouseIncluded(dto.getBlouseIncluded());
        product.setCareInstructions(dto.getCareInstructions());
        product.setBadge(dto.getBadge());
        product.setImageUrl(dto.getImageUrl());
        product.setActive(dto.getActive());
        product.setFeatured(dto.getFeatured());
        if (dto.getVariants() != null) {
            product.setVariants(dto.getVariants().stream()
                    .map(v -> new ProductVariant(v.getName(), v.getHex()))
                    .collect(Collectors.toList()));
        }
        return product;
    }
}
