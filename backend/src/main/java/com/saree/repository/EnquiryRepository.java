package com.saree.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
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

    // Optimized dashboard query methods
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByFollowUpDateLessThanEqualAndStatusNot(LocalDate date, EnquiryStatus status);
    List<Enquiry> findTop10ByFollowUpDateOrderByUpdatedAtDesc(LocalDate date);
    List<Enquiry> findTop10ByFollowUpDateBeforeAndStatusNotOrderByFollowUpDateAsc(LocalDate date, EnquiryStatus status);
    List<Enquiry> findTop10ByStatusOrderByCreatedAtDesc(EnquiryStatus status);
    List<Enquiry> findTop10ByStatusInOrderByUpdatedAtDesc(Collection<EnquiryStatus> statuses);
    List<Enquiry> findTop10ByOrderByCreatedAtDesc();
}
