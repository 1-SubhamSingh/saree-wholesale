package com.saree.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class AdminAuthService {

    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username:admin1}")
    private String adminUsername;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @Value("${admin.password-hash:}")
    private String adminPasswordHash;

    private String effectivePasswordHash;

    public AdminAuthService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        if (adminPasswordHash != null && !adminPasswordHash.trim().isEmpty()) {
            this.effectivePasswordHash = adminPasswordHash.trim();
        } else if (adminPassword != null && !adminPassword.trim().isEmpty()) {
            this.effectivePasswordHash = passwordEncoder.encode(adminPassword.trim());
        } else {
            this.effectivePasswordHash = passwordEncoder.encode("admin123");
        }
    }

    public boolean authenticate(String username, String rawPassword) {
        if (username == null || rawPassword == null) {
            return false;
        }
        if (!adminUsername.equals(username)) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, effectivePasswordHash);
    }

    public String getAdminUsername() {
        return adminUsername;
    }

    public PasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }
}
