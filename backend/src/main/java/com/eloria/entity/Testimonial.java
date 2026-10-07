package com.eloria.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "testimonials")
public class Testimonial extends BaseEntity {

    @Column(name = "author_name", nullable = false, length = 120)
    private String authorName;

    @Column(name = "author_detail", length = 160)
    private String authorDetail;

    @Column(nullable = false, length = 1200)
    private String quote;

    @Column(name = "treatment_name", length = 120)
    private String treatmentName;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean published = true;
}
