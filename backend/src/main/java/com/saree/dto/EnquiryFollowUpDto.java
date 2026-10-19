package com.saree.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.saree.model.EnquiryStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnquiryFollowUpDto {

    private LocalDate followUpDate;
    private String assignedTo;
    private String preferredContactMethod;
    private LocalDateTime lastContactedAt;
    private EnquiryStatus status;
    private String adminNotes;
}
