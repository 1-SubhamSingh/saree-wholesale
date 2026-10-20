package com.saree.service;

import java.net.InetSocketAddress;
import java.net.Socket;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.saree.BackendApplication;
import com.saree.config.MongoConfig.SmartMongoTransactionManager;
import com.saree.dto.EnquiryFollowUpDto;
import com.saree.dto.EnquiryStatusUpdateDto;
import com.saree.model.AdminAuditLog;
import com.saree.model.Enquiry;
import com.saree.model.EnquiryStatus;
import com.saree.model.Product;
import com.saree.repository.AdminAuditLogRepository;
import com.saree.repository.EnquiryRepository;
import com.saree.repository.ProductRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;

@SpringBootTest(classes = BackendApplication.class)
public class AuditTransactionIntegrationTest {

    @DynamicPropertySource
    static void configureMongoUri(DynamicPropertyRegistry registry) {
        String uri = System.getenv("MONGODB_URI");
        if (uri == null || uri.isBlank()) {
            uri = System.getProperty("MONGODB_URI");
        }
        if (uri == null || uri.isBlank()) {
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress("localhost", 27018), 500);
                uri = "mongodb://localhost:27018/saree_wholesale_tx_test?directConnection=true";
            } catch (Exception e) {
                uri = "mongodb://localhost:27017/saree_wholesale_tx_test";
            }
        }
        final String effectiveUri = uri;
        registry.add("spring.data.mongodb.uri", () -> effectiveUri);
    }

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EnquiryService enquiryService;

    @Autowired
    private EnquiryRepository enquiryRepository;

    @SpyBean
    private AdminAuditLogRepository auditLogRepository;

    @Autowired
    private MongoTransactionManager transactionManager;

    private boolean isReplicaSet;

    @BeforeEach
    void setUp() {
        if (transactionManager instanceof SmartMongoTransactionManager smartManager) {
            isReplicaSet = smartManager.isReplicaSetSupported();
        } else {
            isReplicaSet = true;
        }
        reset(auditLogRepository);
        productRepository.deleteAll();
        enquiryRepository.deleteAll();
        auditLogRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        reset(auditLogRepository);
        productRepository.deleteAll();
        enquiryRepository.deleteAll();
        auditLogRepository.deleteAll();
    }

    @Test
    @DisplayName("Successful product mutation creates expected audit record")
    void successfulProductMutation_createsExpectedAuditRecord() {
        String sku = "TX-SUCCESS-" + java.util.UUID.randomUUID();
        Product product = new Product();
        product.setName("Katan Silk Saree");
        product.setSku(sku);
        product.setPrice(2500.0);
        product.setActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product = productRepository.save(product);

        Product update = new Product();
        update.setName("Katan Silk Saree");
        update.setSku(sku);
        update.setPrice(3200.0);
        update.setActive(true);

        Product result = productService.updateProduct(product.getId(), update);
        assertNotNull(result);
        assertEquals(3200.0, result.getPrice());

        Product fromDb = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(3200.0, fromDb.getPrice());

        List<AdminAuditLog> logs = auditLogRepository.findByEntityIdOrderByTimestampDesc(product.getId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        assertFalse(logs.isEmpty(), "Audit record must be created for price change");
        AdminAuditLog priceLog = logs.stream()
                .filter(l -> "PRODUCT_PRICE_CHANGED".equals(l.getAction()))
                .findFirst()
                .orElse(null);
        assertNotNull(priceLog, "Expected PRODUCT_PRICE_CHANGED audit record");
        assertTrue(priceLog.getOldValue().contains("2500"), "Old value must contain 2500");
        assertTrue(priceLog.getNewValue().contains("3200"), "New value must contain 3200");
    }

    @Test
    @DisplayName("Forced audit failure rolls back product mutation and leaves neither committed")
    void forcedAuditFailure_rollsBackProductMutation_leavesNeitherCommitted() {
        Assumptions.assumeTrue(isReplicaSet, "Replica set required for atomic transaction rollback");

        String sku = "TX-FAIL-" + java.util.UUID.randomUUID();
        Product product = new Product();
        product.setName("Banarasi Weave");
        product.setSku(sku);
        product.setPrice(4000.0);
        product.setActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product = productRepository.save(product);

        long initialAuditCount = auditLogRepository.count();

        // Force audit save failure
        doThrow(new RuntimeException("Simulated audit write failure for transaction test"))
                .when(auditLogRepository).save(any(AdminAuditLog.class));

        Product update = new Product();
        update.setName("Banarasi Weave");
        update.setSku(sku);
        update.setPrice(5500.0);
        update.setActive(true);

        final String productId = product.getId();
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                productService.updateProduct(productId, update)
        );
        assertTrue(ex.getMessage().contains("Simulated audit write failure"),
                "Expected the audit failure exception to propagate out of the transactional service method");

        // Verify rollback: Product price must NOT have changed in DB
        Product fromDb = productRepository.findById(productId).orElseThrow();
        assertEquals(4000.0, fromDb.getPrice(), "Product price mutation must be rolled back to original 4000.0");

        // Verify no audit record was committed
        reset(auditLogRepository);
        long afterAuditCount = auditLogRepository.count();
        assertEquals(initialAuditCount, afterAuditCount, "Failed transaction must leave no audit record committed");
        List<AdminAuditLog> productLogs = auditLogRepository.findByEntityIdOrderByTimestampDesc(productId, org.springframework.data.domain.Pageable.unpaged()).getContent();
        assertTrue(productLogs.isEmpty(), "No audit log should exist for rolled back product mutation");
    }

    @Test
    @DisplayName("Successful enquiry mutation creates expected audit record")
    void successfulEnquiryMutation_createsExpectedAuditRecord() {
        Enquiry enquiry = new Enquiry();
        enquiry.setFullName("Ramesh Kumar");
        enquiry.setBusinessName("Kumar Textiles");
        enquiry.setPhone("9988776655");
        enquiry.setStatus(EnquiryStatus.NEW);
        enquiry.setCreatedAt(LocalDateTime.now());
        enquiry = enquiryRepository.save(enquiry);

        EnquiryStatusUpdateDto dto = new EnquiryStatusUpdateDto();
        dto.setStatus(EnquiryStatus.IN_PROGRESS);
        dto.setAdminNotes("Initial call made, sending samples");

        Enquiry updated = enquiryService.updateEnquiryStatus(enquiry.getId(), dto);
        assertNotNull(updated);
        assertEquals(EnquiryStatus.IN_PROGRESS, updated.getStatus());

        Enquiry fromDb = enquiryRepository.findById(enquiry.getId()).orElseThrow();
        assertEquals(EnquiryStatus.IN_PROGRESS, fromDb.getStatus());
        assertEquals("Initial call made, sending samples", fromDb.getAdminNotes());

        List<AdminAuditLog> logs = auditLogRepository.findByEntityIdOrderByTimestampDesc(enquiry.getId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        assertFalse(logs.isEmpty(), "Audit log should exist for enquiry status update");
        assertTrue(logs.stream().anyMatch(l -> "ENQUIRY_STATUS_CHANGE".equals(l.getAction())));
    }

    @Test
    @DisplayName("Forced audit failure rolls back enquiry mutation and leaves neither committed")
    void forcedAuditFailure_rollsBackEnquiryMutation_leavesNeitherCommitted() {
        Assumptions.assumeTrue(isReplicaSet, "Replica set required for atomic transaction rollback");

        Enquiry enquiry = new Enquiry();
        enquiry.setFullName("Priya Sharma");
        enquiry.setBusinessName("Sharma Silks");
        enquiry.setPhone("9123456780");
        enquiry.setStatus(EnquiryStatus.NEW);
        enquiry.setAdminNotes("Original unedited notes");
        enquiry.setCreatedAt(LocalDateTime.now());
        enquiry = enquiryRepository.save(enquiry);

        long initialAuditCount = auditLogRepository.count();

        // Force audit save failure
        doThrow(new RuntimeException("Simulated audit write failure for enquiry transaction test"))
                .when(auditLogRepository).save(any(AdminAuditLog.class));

        EnquiryFollowUpDto followUpDto = new EnquiryFollowUpDto();
        followUpDto.setStatus(EnquiryStatus.CLOSED);
        followUpDto.setAdminNotes("Attempting to close enquiry with corrupted audit");

        final String enquiryId = enquiry.getId();
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                enquiryService.updateEnquiryFollowUp(enquiryId, followUpDto)
        );
        assertTrue(ex.getMessage().contains("Simulated audit write failure"),
                "Expected the audit failure exception to propagate out of the transactional service method");

        // Verify rollback: Enquiry status and notes must NOT have changed in DB
        Enquiry fromDb = enquiryRepository.findById(enquiryId).orElseThrow();
        assertEquals(EnquiryStatus.NEW, fromDb.getStatus(), "Enquiry status must be rolled back to NEW");
        assertEquals("Original unedited notes", fromDb.getAdminNotes(), "Enquiry adminNotes must be rolled back");

        // Verify no audit record was committed
        reset(auditLogRepository);
        long afterAuditCount = auditLogRepository.count();
        assertEquals(initialAuditCount, afterAuditCount, "Failed transaction must leave no audit record committed");
        List<AdminAuditLog> enquiryLogs = auditLogRepository.findByEntityIdOrderByTimestampDesc(enquiryId, org.springframework.data.domain.Pageable.unpaged()).getContent();
        assertTrue(enquiryLogs.isEmpty(), "No audit log should exist for rolled back enquiry mutation");
    }

    @Test
    @DisplayName("Product toggleActive forced audit failure rolls back deactivation")
    void productToggleActive_forcedAuditFailure_rollsBackDeactivation() {
        Assumptions.assumeTrue(isReplicaSet, "Replica set required for atomic transaction rollback");

        String sku = "TX-DEACT-" + java.util.UUID.randomUUID();
        Product product = new Product();
        product.setName("Chanderi Saree");
        product.setSku(sku);
        product.setPrice(1800.0);
        product.setActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product = productRepository.save(product);

        // Force audit failure
        doThrow(new RuntimeException("Simulated audit write failure for deactivation"))
                .when(auditLogRepository).save(any(AdminAuditLog.class));

        final String productId = product.getId();
        assertThrows(RuntimeException.class, () ->
                productService.toggleActive(productId, false)
        );

        // Verify rollback: product must STILL be active
        Product fromDb = productRepository.findById(productId).orElseThrow();
        assertTrue(fromDb.getActive(), "Product must remain active after transaction rollback");
    }

    @Test
    @DisplayName("Product deletion forced audit failure rolls back deletion")
    void productDeletion_forcedAuditFailure_rollsBackDeletion() {
        Assumptions.assumeTrue(isReplicaSet, "Replica set required for atomic transaction rollback");

        String sku = "TX-DEL-" + java.util.UUID.randomUUID();
        Product product = new Product();
        product.setName("Tussar Silk Saree");
        product.setSku(sku);
        product.setPrice(3500.0);
        product.setActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product = productRepository.save(product);

        // Force audit failure
        doThrow(new RuntimeException("Simulated audit write failure for deletion"))
                .when(auditLogRepository).save(any(AdminAuditLog.class));

        final String productId = product.getId();
        assertThrows(RuntimeException.class, () ->
                productService.deleteProduct(productId)
        );

        // Verify rollback: product must STILL exist in database
        Product fromDb = productRepository.findById(productId).orElse(null);
        assertNotNull(fromDb, "Product must still exist in DB after transaction rollback");
        assertEquals(sku, fromDb.getSku());
    }
}
