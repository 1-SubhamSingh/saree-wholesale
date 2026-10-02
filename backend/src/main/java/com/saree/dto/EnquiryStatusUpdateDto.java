package com.saree.dto;

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
}
