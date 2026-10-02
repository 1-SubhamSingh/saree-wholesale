package com.saree.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.saree.dto.EnquiryRequestDto;
import com.saree.model.Enquiry;
import com.saree.model.EnquiryStatus;
import com.saree.repository.EnquiryRepository;

@Service
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;

    public EnquiryService(EnquiryRepository enquiryRepository) {
        this.enquiryRepository = enquiryRepository;
    }

    public Enquiry createEnquiry(EnquiryRequestDto dto) {
        Enquiry enquiry = new Enquiry();
        enquiry.setFullName(dto.getFullName());
        enquiry.setBusinessName(dto.getBusinessName());
        enquiry.setPhone(dto.getPhone());
        enquiry.setCity(dto.getCity());
        enquiry.setSelectedProduct(dto.getSelectedProduct());
        enquiry.setQuantity(dto.getQuantity());
        enquiry.setMessage(dto.getMessage());
        enquiry.setStatus(EnquiryStatus.NEW);
        enquiry.setCreatedAt(LocalDateTime.now());
        enquiry.setUpdatedAt(LocalDateTime.now());
        return enquiryRepository.save(enquiry);
    }

    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAllByOrderByCreatedAtDesc();
    }

    public Enquiry getEnquiryById(String id) {
        return enquiryRepository.findById(id).orElse(null);
    }

    public Enquiry updateEnquiryStatus(String id, EnquiryStatus newStatus) {
        Enquiry enquiry = enquiryRepository.findById(id).orElse(null);
        if (enquiry == null) {
            return null;
        }
        enquiry.setStatus(newStatus);
        enquiry.setUpdatedAt(LocalDateTime.now());
        return enquiryRepository.save(enquiry);
    }

    public List<Enquiry> getEnquiriesByStatus(EnquiryStatus status) {
        return enquiryRepository.findByStatus(status);
    }
}
