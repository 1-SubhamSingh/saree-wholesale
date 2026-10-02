package com.saree.controller;

import java.util.Collections;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.saree.dto.EnquiryRequestDto;
import com.saree.model.Enquiry;
import com.saree.service.EnquiryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/enquiries")
@CrossOrigin(origins = "http://localhost:5173")
public class EnquiryController {

    private final EnquiryService enquiryService;

    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    @PostMapping
    public ResponseEntity<?> submitEnquiry(@Valid @RequestBody EnquiryRequestDto dto) {
        Enquiry saved = enquiryService.createEnquiry(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Enquiry received successfully",
            "enquiryId", saved.getId()
        ));
    }
}
