package com.saree.service;

import java.time.LocalDate;
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

import com.saree.dto.EnquiryFollowUpDto;
import com.saree.dto.EnquiryRequestDto;
import com.saree.dto.EnquiryStatusUpdateDto;
import com.saree.model.Enquiry;
import com.saree.model.EnquiryStatus;
import com.saree.repository.EnquiryRepository;

@Service
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final MongoTemplate mongoTemplate;
    private final EmailService emailService;

    @Autowired
    public EnquiryService(
            EnquiryRepository enquiryRepository,
            MongoTemplate mongoTemplate,
            @Autowired(required = false) EmailService emailService) {
        this.enquiryRepository = enquiryRepository;
        this.mongoTemplate = mongoTemplate;
        this.emailService = emailService;
    }

    public EnquiryService(EnquiryRepository enquiryRepository) {
        this(enquiryRepository, null, null);
    }

    public EnquiryService(EnquiryRepository enquiryRepository, MongoTemplate mongoTemplate) {
        this(enquiryRepository, mongoTemplate, null);
    }

    public Enquiry createEnquiry(EnquiryRequestDto dto) {
        Enquiry enquiry = new Enquiry();
        enquiry.setFullName(dto.getFullName());
        enquiry.setBusinessName(dto.getBusinessName());
        enquiry.setPhone(dto.getPhone());
        enquiry.setEmail(dto.getEmail());
        enquiry.setCity(dto.getCity());
        enquiry.setSelectedProduct(dto.getSelectedProduct());
        enquiry.setSku(dto.getSku());
        enquiry.setQuantity(dto.getQuantity());
        enquiry.setMessage(dto.getMessage());
        enquiry.setStatus(EnquiryStatus.NEW);
        enquiry.setCreatedAt(LocalDateTime.now());
        enquiry.setUpdatedAt(LocalDateTime.now());
        Enquiry saved = enquiryRepository.save(enquiry);

        // Safe email dispatch (never fails the enquiry submission)
        if (emailService != null) {
            try {
                emailService.sendOwnerNotification(saved);
                emailService.sendCustomerAcknowledgement(saved);
            } catch (Exception ignored) {
                // Email failures are handled safely within EmailService
            }
        }

        return saved;
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
        return getEnquiries(page, size, search, status, sortBy, null);
    }

    public Page<Enquiry> getEnquiries(
            int page,
            int size,
            String search,
            EnquiryStatus status,
            String sortBy,
            String followUp) {

        int normalizedPage = Math.max(0, page);
        int normalizedSize = size <= 0 ? 10 : Math.min(size, 100);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("updated_desc".equalsIgnoreCase(sortBy) || "updatedAt_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "updatedAt");
        } else if ("oldest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "createdAt");
        }
        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, sort);

        LocalDate today = LocalDate.now();

        if (mongoTemplate == null) {
            List<Enquiry> list = status != null ? enquiryRepository.findByStatus(status) : enquiryRepository.findAll();
            if (followUp != null && !followUp.isBlank()) {
                if ("today".equalsIgnoreCase(followUp)) {
                    list = list.stream().filter(e -> today.equals(e.getFollowUpDate())).toList();
                } else if ("overdue".equalsIgnoreCase(followUp)) {
                    list = list.stream().filter(e -> e.getFollowUpDate() != null && e.getFollowUpDate().isBefore(today) && e.getStatus() != EnquiryStatus.CLOSED).toList();
                }
            }
            if (search != null && !search.trim().isEmpty()) {
                String s = search.trim().toLowerCase();
                String digitsOnly = search.replaceAll("[^0-9]", "");
                list = list.stream().filter(e ->
                    (e.getFullName() != null && e.getFullName().toLowerCase().contains(s)) ||
                    (e.getBusinessName() != null && e.getBusinessName().toLowerCase().contains(s)) ||
                    (e.getPhone() != null && (e.getPhone().toLowerCase().contains(s) || (!digitsOnly.isEmpty() && e.getPhone().contains(digitsOnly)))) ||
                    (e.getEmail() != null && e.getEmail().toLowerCase().contains(s)) ||
                    (e.getAssignedTo() != null && e.getAssignedTo().toLowerCase().contains(s))
                ).toList();
            }
            int start = Math.min((int) pageable.getOffset(), list.size());
            int end = Math.min(start + pageable.getPageSize(), list.size());
            return new PageImpl<>(list.subList(start, end), pageable, list.size());
        }

        List<Criteria> criteriaList = new ArrayList<>();

        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status));
        }

        if (followUp != null && !followUp.isBlank()) {
            if ("today".equalsIgnoreCase(followUp)) {
                criteriaList.add(Criteria.where("followUpDate").is(today));
            } else if ("overdue".equalsIgnoreCase(followUp)) {
                criteriaList.add(new Criteria().andOperator(
                        Criteria.where("followUpDate").lt(today),
                        Criteria.where("status").ne(EnquiryStatus.CLOSED)
                ));
            } else if ("upcoming".equalsIgnoreCase(followUp)) {
                criteriaList.add(Criteria.where("followUpDate").gt(today));
            }
        }

        if (search != null && !search.trim().isEmpty()) {
            String trimmed = search.trim();
            Pattern pattern = Pattern.compile(Pattern.quote(trimmed), Pattern.CASE_INSENSITIVE);
            List<Criteria> searchOrs = new ArrayList<>();
            searchOrs.add(Criteria.where("fullName").regex(pattern));
            searchOrs.add(Criteria.where("businessName").regex(pattern));
            searchOrs.add(Criteria.where("phone").regex(pattern));
            searchOrs.add(Criteria.where("email").regex(pattern));
            searchOrs.add(Criteria.where("assignedTo").regex(pattern));

            String digitsOnly = trimmed.replaceAll("[^0-9]", "");
            if (digitsOnly.length() >= 4 && !digitsOnly.equals(trimmed)) {
                searchOrs.add(Criteria.where("phone").regex(Pattern.compile(Pattern.quote(digitsOnly))));
            }

            criteriaList.add(new Criteria().orOperator(searchOrs.toArray(new Criteria[0])));
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

    public Enquiry updateEnquiryFollowUp(String id, EnquiryFollowUpDto dto) {
        Enquiry enquiry = enquiryRepository.findById(id).orElse(null);
        if (enquiry == null) {
            return null;
        }

        if (dto.getFollowUpDate() != null) {
            enquiry.setFollowUpDate(dto.getFollowUpDate());
        }
        if (dto.getAssignedTo() != null) {
            enquiry.setAssignedTo(dto.getAssignedTo().trim());
        }
        if (dto.getPreferredContactMethod() != null) {
            enquiry.setPreferredContactMethod(dto.getPreferredContactMethod());
        }
        if (dto.getLastContactedAt() != null) {
            enquiry.setLastContactedAt(dto.getLastContactedAt());
        }
        if (dto.getStatus() != null) {
            enquiry.setStatus(dto.getStatus());
        }
        if (dto.getAdminNotes() != null) {
            enquiry.setAdminNotes(dto.getAdminNotes());
        }

        enquiry.setUpdatedAt(LocalDateTime.now());
        return enquiryRepository.save(enquiry);
    }

    public Enquiry updateEnquiryStatus(String id, EnquiryStatusUpdateDto dto) {
        Enquiry enquiry = enquiryRepository.findById(id).orElse(null);
        if (enquiry == null) {
            return null;
        }
        if (dto.getStatus() != null) {
            enquiry.setStatus(dto.getStatus());
        }
        if (dto.getAdminNotes() != null) {
            enquiry.setAdminNotes(dto.getAdminNotes());
        }
        if (dto.getFollowUpDate() != null) {
            enquiry.setFollowUpDate(dto.getFollowUpDate());
        }
        if (dto.getAssignedTo() != null) {
            enquiry.setAssignedTo(dto.getAssignedTo().trim());
        }
        if (dto.getPreferredContactMethod() != null) {
            enquiry.setPreferredContactMethod(dto.getPreferredContactMethod());
        }
        if (dto.getLastContactedAt() != null) {
            enquiry.setLastContactedAt(dto.getLastContactedAt());
        }
        enquiry.setUpdatedAt(LocalDateTime.now());
        return enquiryRepository.save(enquiry);
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
