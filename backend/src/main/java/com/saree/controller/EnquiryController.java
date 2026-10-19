package com.saree.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saree.dto.EnquiryRequestDto;
import com.saree.exception.SpamValidationException;
import com.saree.model.Enquiry;
import com.saree.security.CaptchaVerificationService;
import com.saree.security.EnquiryRateLimiter;
import com.saree.service.EnquiryService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/enquiries")
@CrossOrigin(origins = "http://localhost:5173")
public class EnquiryController {

    private static final Logger log = LoggerFactory.getLogger(EnquiryController.class);

    private final EnquiryService enquiryService;
    private final EnquiryRateLimiter rateLimiter;
    private final CaptchaVerificationService captchaService;

    public EnquiryController(
            EnquiryService enquiryService,
            EnquiryRateLimiter rateLimiter,
            CaptchaVerificationService captchaService) {
        this.enquiryService = enquiryService;
        this.rateLimiter = rateLimiter;
        this.captchaService = captchaService;
    }

    @PostMapping
    public ResponseEntity<?> submitEnquiry(
            @Valid @RequestBody EnquiryRequestDto dto,
            HttpServletRequest request) {

        String clientIp = extractClientIp(request);

        // 1. Rate limiting check (throws RateLimitExceededException -> 429)
        rateLimiter.checkRateLimit(clientIp);

        // 2. Honeypot check (hidden field, bots fill it -> 400)
        if (dto.getHoneypot() != null && !dto.getHoneypot().trim().isEmpty()) {
            log.warn("Honeypot triggered from IP: {}, payload value: {}", clientIp, dto.getHoneypot());
            throw new SpamValidationException("Spam detection triggered. Your submission could not be processed.");
        }

        // 3. CAPTCHA / Cloudflare Turnstile verification (if enabled)
        captchaService.verifyToken(dto.getTurnstileToken(), clientIp);

        // 4. Save to MongoDB & dispatch notifications safely
        Enquiry saved = enquiryService.createEnquiry(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Enquiry received successfully",
            "enquiryId", saved.getId()
        ));
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr != null && !remoteAddr.isBlank() ? remoteAddr : "unknown";
    }
}
