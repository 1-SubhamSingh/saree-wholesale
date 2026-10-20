package com.saree.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.saree.dto.AdminAuditLogDto;
import com.saree.model.AdminAuditLog;
import com.saree.model.EnquiryStatus;
import com.saree.repository.AdminAuditLogRepository;

class AdminAuditLogServiceTest {

    private AdminAuditLogRepository repository;
    private AdminAuditLogService service;

    @BeforeEach
    void setUp() {
        repository = mock(AdminAuditLogRepository.class);
        service = new AdminAuditLogService(repository);
        SecurityContextHolder.clearContext();
    }

    @Test
    void recordAction_capturesAuthenticatedAdminAndTimestamp() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("superadmin", null, Collections.emptyList()));

        when(repository.save(any(AdminAuditLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminAuditLog saved = service.recordAction("TEST_ACTION", "PRODUCT", "prod-123", "old", "new");

        assertNotNull(saved);
        assertEquals("superadmin", saved.getAdmin());
        assertEquals("TEST_ACTION", saved.getAction());
        assertEquals("PRODUCT", saved.getEntity());
        assertEquals("prod-123", saved.getEntityId());
        assertEquals("old", saved.getOldValue());
        assertEquals("new", saved.getNewValue());
        assertNotNull(saved.getTimestamp());
    }

    @Test
    void logProductPriceChange_storesStructuredJson() {
        ArgumentCaptor<AdminAuditLog> captor = ArgumentCaptor.forClass(AdminAuditLog.class);
        when(repository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        service.logProductPriceChange("p-1", "SKU-BANARASI-1", 2500.0, 2800.0);

        AdminAuditLog logged = captor.getValue();
        assertEquals("PRODUCT_PRICE_CHANGED", logged.getAction());
        assertEquals("PRODUCT", logged.getEntity());
        assertEquals("p-1", logged.getEntityId());
        assertTrue(logged.getOldValue().contains("2500.0"));
        assertTrue(logged.getNewValue().contains("2800.0"));
        assertTrue(logged.getNewValue().contains("SKU-BANARASI-1"));
    }

    @Test
    void logProductDeactivation_recordsDeactivationEvent() {
        ArgumentCaptor<AdminAuditLog> captor = ArgumentCaptor.forClass(AdminAuditLog.class);
        when(repository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        service.logProductDeactivation("p-2", "SKU-SILK-2", true, false);

        AdminAuditLog logged = captor.getValue();
        assertEquals("PRODUCT_DEACTIVATED", logged.getAction());
        assertTrue(logged.getOldValue().contains("true"));
        assertTrue(logged.getNewValue().contains("false"));
    }

    @Test
    void logProductDeletion_recordsDeletionWithMetadata() {
        ArgumentCaptor<AdminAuditLog> captor = ArgumentCaptor.forClass(AdminAuditLog.class);
        when(repository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        service.logProductDeletion("p-3", "SKU-3", "Crimson Saree", 3200.0);

        AdminAuditLog logged = captor.getValue();
        assertEquals("PRODUCT_DELETED", logged.getAction());
        assertTrue(logged.getOldValue().contains("Crimson Saree"));
        assertTrue(logged.getOldValue().contains("SKU-3"));
    }

    @Test
    void logEnquiryStatusChange_recordsStatusTransition() {
        ArgumentCaptor<AdminAuditLog> captor = ArgumentCaptor.forClass(AdminAuditLog.class);
        when(repository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        service.logEnquiryStatusChange("enq-1", "Varanasi Boutique", EnquiryStatus.NEW, EnquiryStatus.CONTACTED);

        AdminAuditLog logged = captor.getValue();
        assertEquals("ENQUIRY_STATUS_CHANGE", logged.getAction());
        assertEquals("ENQUIRY", logged.getEntity());
        assertTrue(logged.getOldValue().contains("NEW"));
        assertTrue(logged.getNewValue().contains("CONTACTED"));
        assertTrue(logged.getNewValue().contains("Varanasi Boutique"));
    }

    @Test
    void logEnquiryNoteEdit_recordsNotesCleanly() {
        ArgumentCaptor<AdminAuditLog> captor = ArgumentCaptor.forClass(AdminAuditLog.class);
        when(repository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        service.logEnquiryNoteEdit("enq-2", "Surat Textiles", "Requested swatches", "Swatches dispatched via courier");

        AdminAuditLog logged = captor.getValue();
        assertEquals("ENQUIRY_NOTE_EDIT", logged.getAction());
        assertTrue(logged.getOldValue().contains("Requested swatches"));
        assertTrue(logged.getNewValue().contains("Swatches dispatched via courier"));
    }

    @Test
    void auditPayloadsRemainValidJsonForQuotesBackslashesAndNewlines() throws Exception {
        ArgumentCaptor<AdminAuditLog> captor = ArgumentCaptor.forClass(AdminAuditLog.class);
        when(repository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        service.logEnquiryNoteEdit("enq-3", "Buyer \"North\"", "Old\\note\nline", "New \"note\"\\path\nline");

        AdminAuditLog logged = captor.getValue();
        ObjectMapper mapper = new ObjectMapper();
        assertEquals("Old\\note\nline", mapper.readTree(logged.getOldValue()).get("adminNotes").asText());
        assertEquals("New \"note\"\\path\nline", mapper.readTree(logged.getNewValue()).get("adminNotes").asText());
        assertEquals("Buyer \"North\"", mapper.readTree(logged.getNewValue()).get("customerName").asText());
    }

    @Test
    void getAuditLogs_returnsPaginatedDtoResults() {
        AdminAuditLog item = AdminAuditLog.builder()
                .id("log-1")
                .admin("admin")
                .action("PRODUCT_PRICE_CHANGED")
                .entity("PRODUCT")
                .entityId("p-1")
                .timestamp(LocalDateTime.now())
                .oldValue("{}")
                .newValue("{}")
                .build();

        Page<AdminAuditLog> page = new PageImpl<>(List.of(item));
        when(repository.findAllByOrderByTimestampDesc(any(Pageable.class))).thenReturn(page);

        Page<AdminAuditLogDto> dtos = service.getAuditLogs(0, 10, null, null, null, null);

        assertEquals(1, dtos.getTotalElements());
        assertEquals("PRODUCT_PRICE_CHANGED", dtos.getContent().get(0).getAction());
    }
}
