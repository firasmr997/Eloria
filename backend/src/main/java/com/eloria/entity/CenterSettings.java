package com.eloria.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** The single row (id 1) describing the center: address, contact channels and opening hours. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "center_settings")
public class CenterSettings {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(name = "center_name", nullable = false, length = 120)
    private String centerName;

    @Column(length = 200)
    private String tagline;

    @Column(name = "address_line", length = 200)
    private String addressLine;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(length = 80)
    private String city;

    @Column(length = 80)
    private String country;

    @Column(length = 40)
    private String phone;

    @Column(length = 255)
    private String email;

    /** One "Label|Hours" pair per line. */
    @Column(name = "opening_hours", columnDefinition = "text")
    private String openingHours;

    @Column(name = "instagram_url", length = 300)
    private String instagramUrl;

    @Column(name = "facebook_url", length = 300)
    private String facebookUrl;

    @Column(name = "pinterest_url", length = 300)
    private String pinterestUrl;

    @Column(name = "map_url", length = 600)
    private String mapUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
