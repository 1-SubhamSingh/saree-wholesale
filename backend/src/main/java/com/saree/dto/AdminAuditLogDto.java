package com.saree.dto;

import java.time.LocalDateTime;

import com.saree.model.AdminAuditLog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuditLogDto {
    private String id;
    private String admin;
    private String action;
    private String entity;
    private String entityId;
    private LocalDateTime timestamp;
    private String oldValue;
    private String newValue;

    public static AdminAuditLogDto from(AdminAuditLog log) {
        if (log == null) {
            return null;
        }
        return AdminAuditLogDto.builder()
                .id(log.getId())
                .admin(log.getAdmin())
                .action(log.getAction())
                .entity(log.getEntity())
                .entityId(log.getEntityId())
                .timestamp(log.getTimestamp())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .build();
    }
}
