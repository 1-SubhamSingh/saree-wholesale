package com.saree.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.saree.model.AdminAuditLog;

public interface AdminAuditLogRepository extends MongoRepository<AdminAuditLog, String> {
    Page<AdminAuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
    Page<AdminAuditLog> findByEntityOrderByTimestampDesc(String entity, Pageable pageable);
    Page<AdminAuditLog> findByActionOrderByTimestampDesc(String action, Pageable pageable);
    Page<AdminAuditLog> findByAdminOrderByTimestampDesc(String admin, Pageable pageable);
    Page<AdminAuditLog> findByEntityIdOrderByTimestampDesc(String entityId, Pageable pageable);
    List<AdminAuditLog> findTop20ByOrderByTimestampDesc();
}
