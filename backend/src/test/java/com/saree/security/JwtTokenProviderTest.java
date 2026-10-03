package com.saree.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "test-very-secure-jwt-signing-secret-key-2026-min256bit!";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    void generateToken_containsUsernameAndRole() {
        String token = jwtTokenProvider.generateToken("admin1", "ROLE_ADMIN");
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("admin1", jwtTokenProvider.extractUsername(token));
        assertEquals("ROLE_ADMIN", jwtTokenProvider.extractRole(token));
        assertFalse(jwtTokenProvider.isTokenExpired(token));
    }

    @Test
    void validateToken_returnsFalseForInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("not-a-valid-jwt-token"));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken(null));
    }

    @Test
    void validateToken_returnsFalseForTokenSignedWithDifferentSecret() {
        JwtTokenProvider otherProvider = new JwtTokenProvider("different-secret-key-value-for-testing-purposes-256bit!", expirationMs);
        String token = otherProvider.generateToken("admin1", "ROLE_ADMIN");

        assertFalse(jwtTokenProvider.validateToken(token));
    }

    @Test
    void isTokenExpired_returnsTrueForExpiredToken() {
        String expiredToken = jwtTokenProvider.generateExpiredToken("admin1", "ROLE_ADMIN");
        assertNotNull(expiredToken);
        assertFalse(jwtTokenProvider.validateToken(expiredToken));
        assertTrue(jwtTokenProvider.isTokenExpired(expiredToken));
    }
}
