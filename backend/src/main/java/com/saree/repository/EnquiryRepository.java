package com.saree.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.saree.model.Enquiry;
import com.saree.model.EnquiryStatus;

public interface EnquiryRepository extends MongoRepository<Enquiry, String> {
    List<Enquiry> findByStatus(EnquiryStatus status);
    List<Enquiry> findAllByOrderByCreatedAtDesc();
    long countByStatus(EnquiryStatus status);
    List<Enquiry> findByFollowUpDate(LocalDate date);
    List<Enquiry> findByFollowUpDateBeforeAndStatusNot(LocalDate date, EnquiryStatus status);
    long countByFollowUpDate(LocalDate date);
    long countByFollowUpDateBeforeAndStatusNot(LocalDate date, EnquiryStatus status);
}
