package com.saree.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.saree.model.EnquiryStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnquiryStatusUpdateDto {

    @NotNull(message = "Status cannot be null")
    private EnquiryStatus status;

    private String adminNotes;

    private LocalDate followUpDate;
    private String assignedTo;
    private String preferredContactMethod;
    private LocalDateTime lastContactedAt;
}

    