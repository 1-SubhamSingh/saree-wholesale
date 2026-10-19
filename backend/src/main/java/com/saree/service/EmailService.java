package com.saree.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.saree.model.Enquiry;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean emailEnabled;
    private final String ownerEmail;
    private final String fromEmail;

    @Autowired
    public EmailService(
            @Autowired(required = false) JavaMailSender mailSender,
            @Value("${app.email.enabled:false}") boolean emailEnabled,
            @Value("${app.email.owner:admin@rajwadasarees.com}") String ownerEmail,
            @Value("${app.email.from:noreply@rajwadasarees.com}") String fromEmail) {
        this.mailSender = mailSender;
        this.emailEnabled = emailEnabled;
        this.ownerEmail = ownerEmail;
        this.fromEmail = fromEmail;
    }

    /**
     * Sends notification email to the store owner with all required enquiry details:
     * buyer name, business name, phone, city, product, SKU, quantity, and message.
     * Never throws exceptions — failures are logged gracefully.
     */
    public void sendOwnerNotification(Enquiry enquiry) {
        if (!emailEnabled || mailSender == null) {
            log.info("[Email Disabled/Simulated] Owner notification for enquiry: ID={}, Buyer={}, Business={}",
                    enquiry.getId(), enquiry.getFullName(), enquiry.getBusinessName());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(ownerEmail);
            message.setSubject("New B2B Wholesale Enquiry: " + enquiry.getBusinessName() + " (" + enquiry.getFullName() + ")");

            String effectiveSku = enquiry.getSku();
            if ((effectiveSku == null || effectiveSku.isBlank()) && enquiry.getSelectedProduct() != null) {
                // Extract SKU if embedded like "Name (SKU-123)"
                int start = enquiry.getSelectedProduct().lastIndexOf('(');
                int end = enquiry.getSelectedProduct().lastIndexOf(')');
                if (start != -1 && end > start) {
                    effectiveSku = enquiry.getSelectedProduct().substring(start + 1, end).trim();
                }
            }
            if (effectiveSku == null || effectiveSku.isBlank()) {
                effectiveSku = "General Enquiry";
            }

            String body = String.format(
                    """
                    Namaste Team,

                    A new wholesale buyer enquiry has been received on the Rajwada Sarees B2B portal.

                    --- BUYER DETAILS ---
                    • Buyer Name: %s
                    • Business / Boutique: %s
                    • Phone / WhatsApp: %s
                    • Email: %s
                    • City / Location: %s

                    --- ENQUIRY SPECIFICATIONS ---
                    • Product: %s
                    • SKU: %s
                    • Quantity: %s

                    --- BUYER MESSAGE ---
                    %s

                    ---
                    Submitted At: %s
                    Enquiry ID: %s

                    Please follow up promptly via the Rajwada Admin Portal.
                    """,
                    enquiry.getFullName(),
                    enquiry.getBusinessName(),
                    enquiry.getPhone(),
                    enquiry.getEmail() != null ? enquiry.getEmail() : "Not provided",
                    enquiry.getCity(),
                    enquiry.getSelectedProduct() != null ? enquiry.getSelectedProduct() : "General Catalogue",
                    effectiveSku,
                    enquiry.getQuantity(),
                    enquiry.getMessage() != null && !enquiry.getMessage().isBlank() ? enquiry.getMessage() : "None",
                    enquiry.getCreatedAt(),
                    enquiry.getId()
            );

            message.setText(body);
            mailSender.send(message);
            log.info("Owner notification email sent successfully for enquiry ID={}", enquiry.getId());
        } catch (Exception e) {
            log.error("Failed to send owner notification email for enquiry ID={}: {}", enquiry.getId(), e.getMessage());
        }
    }

    /**
     * Sends customer acknowledgement email after successful enquiry submission.
     * Never throws exceptions — failures are logged gracefully.
     */
    public void sendCustomerAcknowledgement(Enquiry enquiry) {
        if (enquiry.getEmail() == null || enquiry.getEmail().isBlank()) {
            log.debug("No customer email provided for enquiry ID={}, skipping acknowledgement email", enquiry.getId());
            return;
        }

        if (!emailEnabled || mailSender == null) {
            log.info("[Email Disabled/Simulated] Customer acknowledgement to {} for enquiry ID={}",
                    enquiry.getEmail(), enquiry.getId());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(enquiry.getEmail());
            message.setSubject("Wholesale Enquiry Received — Rajwada Sarees");

            String body = String.format(
                    """
                    Namaste %s,

                    Thank you for your interest in Rajwada Sarees wholesale collection.

                    We have received your enquiry for "%s" (%s).
                    Our dedicated B2B wholesale desk is reviewing your requirements and will connect with you shortly on %s.

                    Enquiry Summary:
                    • Business: %s
                    • Location: %s
                    • Estimated Volume: %s
                    • Reference ID: %s

                    Warm regards,
                    Wholesale Operations Team
                    Rajwada Sarees | Direct Loom Artisans
                    """,
                    enquiry.getFullName(),
                    enquiry.getSelectedProduct() != null ? enquiry.getSelectedProduct() : "Wholesale Collection",
                    enquiry.getQuantity(),
                    enquiry.getPhone(),
                    enquiry.getBusinessName(),
                    enquiry.getCity(),
                    enquiry.getQuantity(),
                    enquiry.getId()
            );

            message.setText(body);
            mailSender.send(message);
            log.info("Customer acknowledgement email sent to {} for enquiry ID={}", enquiry.getEmail(), enquiry.getId());
        } catch (Exception e) {
            log.error("Failed to send customer acknowledgement email to {}: {}", enquiry.getEmail(), e.getMessage());
        }
    }
}
