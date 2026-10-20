package com.saree.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.saree.dto.EnquiryFollowUpDto;
import com.saree.model.Enquiry;
import com.saree.model.EnquiryStatus;
import com.saree.repository.EnquiryRepository;

class EnquiryServiceAuditTest {
    private EnquiryRepository repository;
    private AdminAuditLogService auditLogService;
    private EnquiryService service;

    @BeforeEach
    void setUp() {
        repository = mock(EnquiryRepository.class);
        auditLogService = mock(AdminAuditLogService.class);
        service = new EnquiryService(repository, null, null, auditLogService);
    }

    @Test
    void followUpUpdateAuditsChangedStatusAndNotesOnlyAfterSave() {
        Enquiry enquiry = enquiry("e-1", EnquiryStatus.NEW, "old note");
        EnquiryFollowUpDto update = new EnquiryFollowUpDto();
        update.setStatus(EnquiryStatus.CONTACTED);
        update.setAdminNotes("new note");
        when(repository.findById("e-1")).thenReturn(Optional.of(enquiry));
        when(repository.save(enquiry)).thenReturn(enquiry);

        service.updateEnquiryFollowUp("e-1", update);

        var order = inOrder(repository, auditLogService);
        order.verify(repository).save(enquiry);
        order.verify(auditLogService).logEnquiryStatusChange("e-1", "Buyer", EnquiryStatus.NEW, EnquiryStatus.CONTACTED);
        order.verify(auditLogService).logEnquiryNoteEdit("e-1", "Buyer", "old note", "new note");
    }

    @Test
    void followUpUpdateDoesNotAuditUnchangedStatusOrNotes() {
        Enquiry enquiry = enquiry("e-1", EnquiryStatus.NEW, "same note");
        EnquiryFollowUpDto update = new EnquiryFollowUpDto();
        update.setStatus(EnquiryStatus.NEW);
        update.setAdminNotes("same note");
        when(repository.findById("e-1")).thenReturn(Optional.of(enquiry));
        when(repository.save(enquiry)).thenReturn(enquiry);

        service.updateEnquiryFollowUp("e-1", update);

        verifyNoInteractions(auditLogService);
    }

    @Test
    void failedFollowUpSaveDoesNotCreateAuditEvents() {
        Enquiry enquiry = enquiry("e-1", EnquiryStatus.NEW, "old note");
        EnquiryFollowUpDto update = new EnquiryFollowUpDto();
        update.setStatus(EnquiryStatus.CONTACTED);
        update.setAdminNotes("new note");
        when(repository.findById("e-1")).thenReturn(Optional.of(enquiry));
        when(repository.save(enquiry)).thenThrow(new IllegalStateException("database unavailable"));

        assertThrows(IllegalStateException.class, () -> service.updateEnquiryFollowUp("e-1", update));

        verifyNoInteractions(auditLogService);
    }

    private Enquiry enquiry(String id, EnquiryStatus status, String notes) {
        Enquiry enquiry = new Enquiry();
        enquiry.setId(id);
        enquiry.setFullName("Buyer");
        enquiry.setStatus(status);
        enquiry.setAdminNotes(notes);
        return enquiry;
    }
}
