package com.saree.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;

import com.saree.dto.DashboardStatsDto;
import com.saree.model.Enquiry;
import com.saree.model.EnquiryStatus;
import com.saree.model.Product;
import com.saree.repository.EnquiryRepository;
import com.saree.repository.ProductRepository;

class DashboardServiceTest {

    private ProductRepository productRepository;
    private EnquiryRepository enquiryRepository;
    private MongoTemplate mongoTemplate;
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        enquiryRepository = mock(EnquiryRepository.class);
        mongoTemplate = mock(MongoTemplate.class);
        dashboardService = new DashboardService(productRepository, enquiryRepository, mongoTemplate);
    }

    @Test
    void getDashboardStats_calculatesMetricsUsingDatabaseQueries() {
        // Mock product counts
        when(productRepository.count()).thenReturn(15L);
        when(productRepository.countByActiveTrue()).thenReturn(12L);
        when(productRepository.countByActiveFalse()).thenReturn(3L);

        // Mock enquiry counts by status
        when(enquiryRepository.count()).thenReturn(20L);
        when(enquiryRepository.countByStatus(EnquiryStatus.NEW)).thenReturn(5L);
        when(enquiryRepository.countByStatus(EnquiryStatus.CONTACTED)).thenReturn(4L);
        when(enquiryRepository.countByStatus(EnquiryStatus.IN_PROGRESS)).thenReturn(6L);
        when(enquiryRepository.countByStatus(EnquiryStatus.CLOSED)).thenReturn(5L);

        // Mock follow-up counts and lists
        LocalDate today = LocalDate.now();
        when(enquiryRepository.countByFollowUpDate(today)).thenReturn(2L);
        when(enquiryRepository.countByFollowUpDateBeforeAndStatusNot(today, EnquiryStatus.CLOSED)).thenReturn(3L);

        Enquiry enq1 = new Enquiry();
        enq1.setId("e1");
        enq1.setFullName("Buyer One");
        when(enquiryRepository.findTop10ByFollowUpDateOrderByUpdatedAtDesc(today))
                .thenReturn(List.of(enq1));
        when(enquiryRepository.findTop10ByFollowUpDateBeforeAndStatusNotOrderByFollowUpDateAsc(today, EnquiryStatus.CLOSED))
                .thenReturn(Collections.emptyList());
        when(enquiryRepository.findTop10ByStatusOrderByCreatedAtDesc(EnquiryStatus.NEW))
                .thenReturn(List.of(enq1));
        when(enquiryRepository.findTop10ByStatusInOrderByUpdatedAtDesc(anyCollection()))
                .thenReturn(Collections.emptyList());

        // Mock today enquiries & recent
        when(enquiryRepository.countByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(4L);
        when(enquiryRepository.findTop10ByOrderByCreatedAtDesc()).thenReturn(List.of(enq1));

        Product p1 = new Product();
        p1.setId("p1");
        p1.setSku("SKU-1");
        p1.setCategory("Banarasi Weave");
        when(productRepository.findTop10ByOrderByUpdatedAtDesc()).thenReturn(List.of(p1));

        // Mock aggregation for categories
        DashboardService.CategoryCountResult catResult = new DashboardService.CategoryCountResult();
        catResult.setId("Banarasi Weave");
        catResult.setCount(15L);
        AggregationResults<DashboardService.CategoryCountResult> aggResults =
                new AggregationResults<>(List.of(catResult), new org.bson.Document());
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("products"), eq(DashboardService.CategoryCountResult.class)))
                .thenReturn(aggResults);

        // Execute
        DashboardStatsDto stats = dashboardService.getDashboardStats();

        // Verify counts
        assertNotNull(stats);
        assertEquals(15L, stats.getTotalProducts());
        assertEquals(12L, stats.getActiveProducts());
        assertEquals(3L, stats.getInactiveProducts());
        assertEquals(20L, stats.getTotalEnquiries());
        assertEquals(5L, stats.getNewEnquiries());
        assertEquals(4L, stats.getContactedEnquiries());
        assertEquals(6L, stats.getInProgressEnquiries());
        assertEquals(5L, stats.getClosedEnquiries());

        // Verify status breakdown map
        assertEquals(4, stats.getEnquiriesByStatus().size());
        assertEquals(5L, stats.getEnquiriesByStatus().get("NEW"));

        // Verify category breakdown
        assertEquals(15L, stats.getProductsByCategory().get("Banarasi Weave"));

        // Verify follow-ups and pending metrics
        assertEquals(2L, stats.getTodayFollowUps());
        assertEquals(3L, stats.getOverdueFollowUps());
        assertEquals(5L, stats.getPendingFollowUps()); // 2 today + 3 overdue
        assertEquals(4L, stats.getTodayEnquiries());

        // Verify lists
        assertEquals(1, stats.getTodayFollowUpsList().size());
        assertEquals(1, stats.getRecentEnquiries().size());
        assertEquals(1, stats.getRecentProducts().size());

        // CRITICAL: verify that findAll was NOT called on repositories during normal operation
        verify(productRepository, never()).findAll();
        verify(enquiryRepository, never()).findAll();
    }
}
