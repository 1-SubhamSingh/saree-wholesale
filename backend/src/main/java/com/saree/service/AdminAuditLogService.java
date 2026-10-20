package com.saree.service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
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
        String oldVal = json("price", oldPrice, "sku", sku);
        String newVal = json("price", newPrice, "sku", sku);
        recordAction("PRODUCT_PRICE_CHANGED", "PRODUCT", productId, oldVal, newVal);
    }

    public void logProductDeactivation(String productId, String sku, Boolean oldActive, Boolean newActive) {
        String oldVal = json("active", oldActive, "sku", sku);
        String newVal = json("active", newActive, "sku", sku);
        recordAction("PRODUCT_DEACTIVATED", "PRODUCT", productId, oldVal, newVal);
    }

    public void logProductDeletion(String productId, String sku, String name, Double price) {
        String oldVal = json("sku", sku, "name", name, "price", price);
        recordAction("PRODUCT_DELETED", "PRODUCT", productId, oldVal, "null");
    }

    public void logEnquiryStatusChange(String enquiryId, String customerName, EnquiryStatus oldStatus, EnquiryStatus newStatus) {
        String oldVal = json("status", oldStatus != null ? oldStatus.name() : null, "customerName", customerName);
        String newVal = json("status", newStatus != null ? newStatus.name() : null, "customerName", customerName);
        recordAction("ENQUIRY_STATUS_CHANGE", "ENQUIRY", enquiryId, oldVal, newVal);
    }

    public void logEnquiryNoteEdit(String enquiryId, String customerName, String oldNote, String newNote) {
        String oldVal = json("adminNotes", oldNote, "customerName", customerName);
        String newVal = json("adminNotes", newNote, "customerName", customerName);
        recordAction("ENQUIRY_NOTE_EDIT", "ENQUIRY", enquiryId, oldVal, newVal);
    }

    private String json(Object... values) {
        Map<String, Object> fields = new LinkedHashMap<>();
        for (int index = 0; index < values.length; index += 2) {
            fields.put((String) values[index], values[index + 1]);
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(fields);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize audit log data", exception);
        }
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
