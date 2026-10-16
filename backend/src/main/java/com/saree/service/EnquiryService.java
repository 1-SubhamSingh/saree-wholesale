package com.saree.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.saree.dto.EnquiryRequestDto;
import com.saree.model.Enquiry;
import com.saree.model.EnquiryStatus;
import com.saree.repository.EnquiryRepository;

@Service
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final MongoTemplate mongoTemplate;

    @Autowired
    public EnquiryService(EnquiryRepository enquiryRepository, MongoTemplate mongoTemplate) {
        this.enquiryRepository = enquiryRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public EnquiryService(EnquiryRepository enquiryRepository) {
        this(enquiryRepository, null);
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

    public Page<Enquiry> getEnquiries(
            int page,
            int size,
            String search,
            EnquiryStatus status,
            String sortBy) {

        int normalizedPage = Math.max(0, page);
        int normalizedSize = size <= 0 ? 10 : Math.min(size, 100);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("updated_desc".equalsIgnoreCase(sortBy) || "updatedAt_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "updatedAt");
        } else if ("oldest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "createdAt");
        }
        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, sort);

        if (mongoTemplate == null) {
            if (status != null) {
                List<Enquiry> byStatus = enquiryRepository.findByStatus(status);
                int start = Math.min((int) pageable.getOffset(), byStatus.size());
                int end = Math.min(start + pageable.getPageSize(), byStatus.size());
                return new PageImpl<>(byStatus.subList(start, end), pageable, byStatus.size());
            }
            return enquiryRepository.findAll(pageable);
        }

        List<Criteria> criteriaList = new ArrayList<>();

        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status));
        }

        if (search != null && !search.trim().isEmpty()) {
            String trimmed = search.trim();
            Pattern pattern = Pattern.compile(Pattern.quote(trimmed), Pattern.CASE_INSENSITIVE);
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("fullName").regex(pattern),
                    Criteria.where("businessName").regex(pattern),
                    Criteria.where("phone").regex(pattern)
            ));
        }

        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            if (criteriaList.size() == 1) {
                query.addCriteria(criteriaList.get(0));
            } else {
                query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
            }
        }

        long totalElements = mongoTemplate.count(query, Enquiry.class);
        query.with(pageable);
        List<Enquiry> content = mongoTemplate.find(query, Enquiry.class);

        return new PageImpl<>(content, pageable, totalElements);
    }

    public Enquiry getEnquiryById(String id) {
        return enquiryRepository.findById(id).orElse(null);
    }

    public Enquiry updateEnquiryStatus(String id, EnquiryStatus newStatus, String adminNotes) {
        Enquiry enquiry = enquiryRepository.findById(id).orElse(null);
        if (enquiry == null) {
            return null;
        }
        if (newStatus != null) {
            enquiry.setStatus(newStatus);
        }
        if (adminNotes != null) {
            enquiry.setAdminNotes(adminNotes);
        }
        enquiry.setUpdatedAt(LocalDateTime.now());
        return enquiryRepository.save(enquiry);
    }

    public Enquiry updateEnquiryStatus(String id, EnquiryStatus newStatus) {
        return updateEnquiryStatus(id, newStatus, null);
    }

    public Enquiry updateEnquiryNotes(String id, String adminNotes) {
        Enquiry enquiry = enquiryRepository.findById(id).orElse(null);
        if (enquiry == null) {
            return null;
        }
        enquiry.setAdminNotes(adminNotes);
        enquiry.setUpdatedAt(LocalDateTime.now());
        return enquiryRepository.save(enquiry);
    }

    public List<Enquiry> getEnquiriesByStatus(EnquiryStatus status) {
        return enquiryRepository.findByStatus(status);
    }
}
