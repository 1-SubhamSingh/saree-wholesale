package com.saree.dto;

import java.util.List;
import java.util.Map;

import com.saree.model.Enquiry;
import com.saree.model.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private long totalProducts;
    private long activeProducts;
    private long inactiveProducts;
    private long totalEnquiries;
    private long newEnquiries;
    private long contactedEnquiries;
    private long inProgressEnquiries;
    private long closedEnquiries;
    private Map<String, Long> enquiriesByStatus;
    private Map<String, Long> productsByCategory;

    // Mini CRM follow-up & lead management sections
    private long todayFollowUps;
    private long overdueFollowUps;
    private List<Enquiry> todayFollowUpsList;
    private List<Enquiry> overdueFollowUpsList;
    private List<Enquiry> newEnquiriesList;
    private List<Enquiry> inProgressEnquiriesList;

    // New optimized dashboard data fields
    private long todayEnquiries;
    private long pendingFollowUps;
    private List<Enquiry> recentEnquiries;
    private List<Product> recentProducts;
}
