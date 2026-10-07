package com.eloria.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A team member. Specialties are stored one per line. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "specialists")
public class Specialist extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 140)
    private String slug;

    @Column(nullable = false, length = 140)
    private String role;

    @Column(nullable = false, columnDefinition = "text")
    private String bio;

    @Column(length = 1000)
    private String photo;

    @Column(length = 80)
    private String experience;

    @Column(columnDefinition = "text")
    private String specialties;

    @Column(name = "instagram_url", length = 300)
    private String instagramUrl;

    @Column(name = "linkedin_url", length = 300)
    private String linkedinUrl;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
