package com.saree.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "admin_audit_logs")
@CompoundIndexes({
    @CompoundIndex(name = "entity_timestamp_idx", def = "{'entity': 1, 'timestamp': -1}"),
    @CompoundIndex(name = "admin_timestamp_idx", def = "{'admin': 1, 'timestamp': -1}"),
    @CompoundIndex(name = "action_timestamp_idx", def = "{'action': 1, 'timestamp': -1}")
})
public class AdminAuditLog {

    @Id
    private String id;

    @Indexed
    private String admin;

    @Indexed
    private String action; // e.g. PRODUCT_PRICE_CHANGED, PRODUCT_DEACTIVATED, PRODUCT_DELETED, ENQUIRY_STATUS_CHANGED, ENQUIRY_NOTE_UPDATED

    @Indexed
    private String entity; // e.g. PRODUCT, ENQUIRY

    @Indexed
    private String entityId;

    @Indexed
    private LocalDateTime timestamp;

    private String oldValue;
    private String newValue;
}
