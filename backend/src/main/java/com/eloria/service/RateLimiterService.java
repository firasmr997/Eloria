package com.eloria.service;

import com.eloria.exception.RateLimitExceededException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * In-memory fixed-window limiter for sign-in and public-form abuse. Per instance only; put a shared store
 * (Redis, a gateway) in front when running several backend replicas.
 */
@Service
public class RateLimiterService {

    private static final int MAX_TRACKED_KEYS = 10_000;

    private final ConcurrentMap<String, Window> windows = new ConcurrentHashMap<>();
    private final Clock clock;

    @Autowired
    public RateLimiterService() {
        this(Clock.systemUTC());
    }

    RateLimiterService(Clock clock) {
        this.clock = clock;
    }

    /** Counts one attempt for {@code key} and throws once more than {@code limit} happen within {@code window}. */
    public void check(String key, int limit, Duration window, String message) {
        Instant now = clock.instant();
        if (windows.size() > MAX_TRACKED_KEYS) {
            windows.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
        }
        Window current = windows.compute(key, (k, existing) -> {
            if (existing == null || existing.expiresAt().isBefore(now)) {
                return new Window(1, now.plus(window));
            }
            return new Window(existing.count() + 1, existing.expiresAt());
        });
        if (current.count() > limit) {
            throw new RateLimitExceededException(message);
        }
    }

    public void reset(String key) {
        windows.remove(key);
    }

    private record Window(int count, Instant expiresAt) {
    }
}
