package com.saree.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "enquiries")
public class Enquiry {

    @Id
    private String id;

    private String fullName;
    private String businessName;
    private String phone;
    private String email;
    private String city;
    private String selectedProduct;
    private String sku;
    private String quantity;
    private String message;
    private EnquiryStatus status = EnquiryStatus.NEW;
    private String adminNotes;

    // Mini CRM & Follow-up fields
    private LocalDate followUpDate;
    private String assignedTo;
    private String preferredContactMethod; // e.g. "WHATSAPP", "PHONE", "EMAIL"
    private LocalDateTime lastContactedAt;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
