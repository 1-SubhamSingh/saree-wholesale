package com.saree.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class AdminAuthServiceTest {

    @Test
    void authenticate_withValidPassword_returnsTrue() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        AdminAuthService service = new AdminAuthService(encoder);

        ReflectionTestUtils.setField(service, "adminUsername", "admin1");
        ReflectionTestUtils.setField(service, "adminPassword", "admin123");
        ReflectionTestUtils.setField(service, "adminPasswordHash", "");
        service.init();

        assertTrue(service.authenticate("admin1", "admin123"));
    }

    @Test
    void authenticate_withInvalidPassword_returnsFalse() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        AdminAuthService service = new AdminAuthService(encoder);

        ReflectionTestUtils.setField(service, "adminUsername", "admin1");
        ReflectionTestUtils.setField(service, "adminPassword", "admin123");
        ReflectionTestUtils.setField(service, "adminPasswordHash", "");
        service.init();

        assertFalse(service.authenticate("admin1", "wrongpassword"));
    }

    @Test
    void authenticate_withInvalidUsername_returnsFalse() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        AdminAuthService service = new AdminAuthService(encoder);

        ReflectionTestUtils.setField(service, "adminUsername", "admin1");
        ReflectionTestUtils.setField(service, "adminPassword", "admin123");
        service.init();

        assertFalse(service.authenticate("unknown_user", "admin123"));
    }

    @Test
    void authenticate_withNullCredentials_returnsFalse() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        AdminAuthService service = new AdminAuthService(encoder);

        ReflectionTestUtils.setField(service, "adminUsername", "admin1");
        ReflectionTestUtils.setField(service, "adminPassword", "admin123");
        service.init();

        assertFalse(service.authenticate(null, "admin123"));
        assertFalse(service.authenticate("admin1", null));
        assertFalse(service.authenticate(null, null));
    }

    @Test
    void authenticate_withPrecomputedHash_verifiesSuccessfully() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashedPassword = encoder.encode("customSecretPass99!");

        AdminAuthService service = new AdminAuthService(encoder);
        ReflectionTestUtils.setField(service, "adminUsername", "admin1");
        ReflectionTestUtils.setField(service, "adminPassword", "");
        ReflectionTestUtils.setField(service, "adminPasswordHash", hashedPassword);
        service.init();

        assertTrue(service.authenticate("admin1", "customSecretPass99!"));
        assertFalse(service.authenticate("admin1", "wrongPass"));
    }

    @Test
    void bcryptHashing_matchesExpectedProperties() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        String raw = "superSecureAdminPassword2026!";
        String encoded = encoder.encode(raw);

        assertNotNull(encoded);
        assertTrue(encoded.startsWith("$2a$") || encoded.startsWith("$2b$"));
        assertTrue(encoder.matches(raw, encoded));
        assertFalse(encoder.matches("incorrect", encoded));
    }
}
