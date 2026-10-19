package com.saree.security;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.saree.exception.RateLimitExceededException;

@Component
public class EnquiryRateLimiter {

    private final int maxRequests;
    private final long windowSeconds;
    private final Map<String, Deque<Long>> requestHistory = new ConcurrentHashMap<>();

    public EnquiryRateLimiter(
            @Value("${app.security.ratelimit.requests-per-window:10}") int maxRequests,
            @Value("${app.security.ratelimit.window-seconds:300}") long windowSeconds) {
        this.maxRequests = maxRequests;
        this.windowSeconds = windowSeconds;
    }

    /**
     * Checks if the given client IP has exceeded the allowed enquiry submissions within the sliding window.
     * Throws RateLimitExceededException if exceeded.
     */
    public synchronized void checkRateLimit(String clientIp) {
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = "unknown";
        }

        long now = Instant.now().getEpochSecond();
        long windowStart = now - windowSeconds;

        Deque<Long> timestamps = requestHistory.computeIfAbsent(clientIp, k -> new ArrayDeque<>());

        // Evict expired entries outside the sliding window
        while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxRequests) {
            throw new RateLimitExceededException(
                    "Rate limit exceeded: maximum " + maxRequests + " enquiries allowed every " +
                    (windowSeconds >= 60 ? (windowSeconds / 60) + " minutes" : windowSeconds + " seconds") +
                    ". Please try again later."
            );
        }

        timestamps.addLast(now);
    }

    /**
     * Reset rate limit state (useful for test suites).
     */
    public void reset() {
        requestHistory.clear();
    }
}
