package com.saree.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.saree.model.Enquiry;
import com.saree.model.EnquiryStatus;

public interface EnquiryRepository extends MongoRepository<Enquiry, String> {
    List<Enquiry> findByStatus(EnquiryStatus status);
    List<Enquiry> findAllByOrderByCreatedAtDesc();
    long countByStatus(EnquiryStatus status);
}
