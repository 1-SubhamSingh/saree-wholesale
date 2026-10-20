package com.saree.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "enquiries")
@CompoundIndexes({
    @CompoundIndex(name = "followup_status_idx", def = "{'followUpDate': 1, 'status': 1}"),
    @CompoundIndex(name = "status_createdAt_idx", def = "{'status': 1, 'createdAt': -1}")
})
public class Enquiry {

    @Id
    private String id;

    private String fullName;
    private String businessName;

    @Indexed
    private String phone;

    private String email;
    private String city;
    private String selectedProduct;
    private String sku;
    private String quantity;
    private String message;

    @Indexed
    private EnquiryStatus status = EnquiryStatus.NEW;

    private String adminNotes;

    // Mini CRM & Follow-up fields
    @Indexed
    private LocalDate followUpDate;

    private String assignedTo;
    private String preferredContactMethod; // e.g. "WHATSAPP", "PHONE", "EMAIL"
    private LocalDateTime lastContactedAt;

    @Indexed
    private LocalDateTime createdAt = LocalDateTime.now();

    @Indexed
    private LocalDateTime updatedAt = LocalDateTime.now();
}
