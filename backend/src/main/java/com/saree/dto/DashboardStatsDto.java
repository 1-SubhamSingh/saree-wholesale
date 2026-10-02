package com.saree.dto;

import java.util.Map;

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
}
