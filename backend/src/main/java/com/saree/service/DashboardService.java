package com.saree.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.saree.dto.DashboardStatsDto;
import com.saree.model.Enquiry;
import com.saree.model.EnquiryStatus;
import com.saree.model.Product;
import com.saree.repository.EnquiryRepository;
import com.saree.repository.ProductRepository;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final EnquiryRepository enquiryRepository;

    public DashboardService(ProductRepository productRepository, EnquiryRepository enquiryRepository) {
        this.productRepository = productRepository;
        this.enquiryRepository = enquiryRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        List<Product> products = productRepository.findAll();
        List<Enquiry> enquiries = enquiryRepository.findAll();

        long totalProducts = products.size();
        long activeProducts = products.stream().filter(p -> p.getActive() == null || p.getActive()).count();
        long inactiveProducts = totalProducts - activeProducts;

        long totalEnquiries = enquiries.size();
        long newEnquiries = enquiries.stream().filter(e -> e.getStatus() == EnquiryStatus.NEW).count();
        long contactedEnquiries = enquiries.stream().filter(e -> e.getStatus() == EnquiryStatus.CONTACTED).count();
        long inProgressEnquiries = enquiries.stream().filter(e -> e.getStatus() == EnquiryStatus.IN_PROGRESS).count();
        long closedEnquiries = enquiries.stream().filter(e -> e.getStatus() == EnquiryStatus.CLOSED).count();

        Map<String, Long> enquiriesByStatus = new HashMap<>();
        enquiriesByStatus.put("NEW", newEnquiries);
        enquiriesByStatus.put("CONTACTED", contactedEnquiries);
        enquiriesByStatus.put("IN_PROGRESS", inProgressEnquiries);
        enquiriesByStatus.put("CLOSED", closedEnquiries);

        Map<String, Long> productsByCategory = products.stream()
                .filter(p -> p.getCategory() != null && !p.getCategory().isBlank())
                .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting()));

        return DashboardStatsDto.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .inactiveProducts(inactiveProducts)
                .totalEnquiries(totalEnquiries)
                .newEnquiries(newEnquiries)
                .contactedEnquiries(contactedEnquiries)
                .inProgressEnquiries(inProgressEnquiries)
                .closedEnquiries(closedEnquiries)
                .enquiriesByStatus(enquiriesByStatus)
                .productsByCategory(productsByCategory)
                .build();
    }
}
