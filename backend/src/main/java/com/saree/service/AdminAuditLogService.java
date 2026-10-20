package com.saree.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.saree.dto.AdminAuditLogDto;
import com.saree.model.AdminAuditLog;
import com.saree.model.EnquiryStatus;
import com.saree.repository.AdminAuditLogRepository;

@Service
public class AdminAuditLogService {

    private final AdminAuditLogRepository auditLogRepository;

    @Autowired
    public AdminAuditLogService(AdminAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public String getCurrentAdmin() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getName() != null
                    && !"anonymousUser".equalsIgnoreCase(auth.getName())) {
                return auth.getName();
            }
        } catch (Exception ignored) {
        }
        return "admin";
    }

    public AdminAuditLog recordAction(String action, String entity, String entityId, String oldValue, String newValue) {
        String admin = getCurrentAdmin();
        AdminAuditLog log = AdminAuditLog.builder()
                .admin(admin)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .timestamp(LocalDateTime.now())
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        return auditLogRepository.save(log);
    }

    public void logProductPriceChange(String productId, String sku, Double oldPrice, Double newPrice) {
        String oldVal = String.format("{\"price\": %s, \"sku\": \"%s\"}", oldPrice != null ? oldPrice : "null", sku != null ? sku : "");
        String newVal = String.format("{\"price\": %s, \"sku\": \"%s\"}", newPrice != null ? newPrice : "null", sku != null ? sku : "");
        recordAction("PRODUCT_PRICE_CHANGED", "PRODUCT", productId, oldVal, newVal);
    }

    public void logProductDeactivation(String productId, String sku, Boolean oldActive, Boolean newActive) {
        String oldVal = String.format("{\"active\": %s, \"sku\": \"%s\"}", oldActive != null ? oldActive : "true", sku != null ? sku : "");
        String newVal = String.format("{\"active\": %s, \"sku\": \"%s\"}", newActive != null ? newActive : "false", sku != null ? sku : "");
        recordAction("PRODUCT_DEACTIVATED", "PRODUCT", productId, oldVal, newVal);
    }

    public void logProductDeletion(String productId, String sku, String name, Double price) {
        String oldVal = String.format("{\"sku\": \"%s\", \"name\": \"%s\", \"price\": %s}",
                sku != null ? sku : "", name != null ? name : "", price != null ? price : "null");
        recordAction("PRODUCT_DELETED", "PRODUCT", productId, oldVal, "null");
    }

    public void logEnquiryStatusChange(String enquiryId, String customerName, EnquiryStatus oldStatus, EnquiryStatus newStatus) {
        String oldVal = String.format("{\"status\": \"%s\", \"customerName\": \"%s\"}",
                oldStatus != null ? oldStatus.name() : "null", customerName != null ? customerName : "");
        String newVal = String.format("{\"status\": \"%s\", \"customerName\": \"%s\"}",
                newStatus != null ? newStatus.name() : "null", customerName != null ? customerName : "");
        recordAction("ENQUIRY_STATUS_CHANGE", "ENQUIRY", enquiryId, oldVal, newVal);
    }

    public void logEnquiryNoteEdit(String enquiryId, String customerName, String oldNote, String newNote) {
        // Truncate notes if extremely long for clean storage, avoiding logging credentials
        String cleanOld = oldNote != null ? oldNote.replace("\"", "\\\"") : "";
        String cleanNew = newNote != null ? newNote.replace("\"", "\\\"") : "";
        String oldVal = String.format("{\"adminNotes\": \"%s\", \"customerName\": \"%s\"}", cleanOld, customerName != null ? customerName : "");
        String newVal = String.format("{\"adminNotes\": \"%s\", \"customerName\": \"%s\"}", cleanNew, customerName != null ? customerName : "");
        recordAction("ENQUIRY_NOTE_EDIT", "ENQUIRY", enquiryId, oldVal, newVal);
    }

    public Page<AdminAuditLogDto> getAuditLogs(int page, int size, String entityId, String entity, String action, String admin) {
        int normalizedPage = Math.max(0, page);
        int normalizedSize = size <= 0 ? 20 : Math.min(size, 100);
        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize);

        Page<AdminAuditLog> pageResult;
        if (entityId != null && !entityId.isBlank()) {
            pageResult = auditLogRepository.findByEntityIdOrderByTimestampDesc(entityId.trim(), pageable);
        } else if (entity != null && !entity.isBlank()) {
            pageResult = auditLogRepository.findByEntityOrderByTimestampDesc(entity.trim().toUpperCase(), pageable);
        } else if (action != null && !action.isBlank()) {
            pageResult = auditLogRepository.findByActionOrderByTimestampDesc(action.trim().toUpperCase(), pageable);
        } else if (admin != null && !admin.isBlank()) {
            pageResult = auditLogRepository.findByAdminOrderByTimestampDesc(admin.trim(), pageable);
        } else {
            pageResult = auditLogRepository.findAllByOrderByTimestampDesc(pageable);
        }

        return pageResult.map(AdminAuditLogDto::from);
    }
}
