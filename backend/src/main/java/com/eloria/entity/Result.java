package com.eloria.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A before / after case. The treatment link is optional: deleting a treatment keeps its results. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "results")
public class Result extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_id")
    private Treatment treatment;

    @Column(name = "before_image_url", nullable = false, length = 1000)
    private String beforeImageUrl;

    @Column(name = "after_image_url", nullable = false, length = 1000)
    private String afterImageUrl;

    @Column(nullable = false, length = 140)
    private String title;

    @Column(length = 1200)
    private String description;

    /** Free text such as "3 sessions over 12 weeks". */
    @Column(name = "duration_label", length = 120)
    private String durationLabel;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
