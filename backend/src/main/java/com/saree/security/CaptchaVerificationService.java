package com.saree.security;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.saree.exception.SpamValidationException;

@Service
public class CaptchaVerificationService {

    private static final Logger log = LoggerFactory.getLogger(CaptchaVerificationService.class);
    private static final String TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private final boolean turnstileEnabled;
    private final String turnstileSecret;
    private final RestTemplate restTemplate;

    public CaptchaVerificationService(
            @Value("${app.security.turnstile.enabled:false}") boolean turnstileEnabled,
            @Value("${app.security.turnstile.secret:}") String turnstileSecret) {
        this.turnstileEnabled = turnstileEnabled;
        this.turnstileSecret = turnstileSecret;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Verifies Turnstile/CAPTCHA token if configured and enabled.
     * Throws SpamValidationException if enabled and verification fails.
     */
    public void verifyToken(String token, String clientIp) {
        if (!turnstileEnabled || turnstileSecret == null || turnstileSecret.isBlank()) {
            // Disabled or unconfigured: skip verification safely
            return;
        }

        if (token == null || token.isBlank()) {
            throw new SpamValidationException("CAPTCHA verification token is required.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("secret", turnstileSecret);
            body.add("response", token);
            if (clientIp != null && !clientIp.isBlank()) {
                body.add("remoteip", clientIp);
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(TURNSTILE_VERIFY_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Boolean success = (Boolean) response.getBody().get("success");
                if (Boolean.TRUE.equals(success)) {
                    log.debug("Turnstile verification succeeded for IP: {}", clientIp);
                    return;
                }
            }

            log.warn("Turnstile verification rejected for IP: {}", clientIp);
            throw new SpamValidationException("CAPTCHA verification failed. Please try again.");
        } catch (SpamValidationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error communicating with Cloudflare Turnstile API: {}", e.getMessage());
            // In case of network failure to Turnstile, fail safely or log
            throw new SpamValidationException("Unable to verify security challenge. Please try again.");
        }
    }

    public boolean isTurnstileEnabled() {
        return turnstileEnabled && turnstileSecret != null && !turnstileSecret.isBlank();
    }
}
