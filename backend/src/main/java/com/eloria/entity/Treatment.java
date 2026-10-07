package com.eloria.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * A treatment in the catalogue. Benefits, preparation, aftercare and contraindications are stored as
 * newline-separated text and exposed as lists by the mapper.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "treatments")
public class Treatment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private TreatmentCategory category;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 140)
    private String slug;

    @Column(name = "short_description", nullable = false, length = 280)
    private String shortDescription;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(length = 120)
    private String sessions;

    @Column(length = 120)
    private String downtime;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /** When true the price is a starting price ("from €X"). */
    @Column(name = "price_from", nullable = false)
    private boolean priceFrom;

    @Column(columnDefinition = "text")
    private String benefits;

    @Column(columnDefinition = "text")
    private String preparation;

    @Column(columnDefinition = "text")
    private String aftercare;

    @Column(columnDefinition = "text")
    private String contraindications;

    @Column(length = 200)
    private String technology;

    @Column(name = "main_image_url", length = 1000)
    private String mainImageUrl;

    @Column(name = "main_image_alt", length = 240)
    private String mainImageAlt;

    @Column(nullable = false)
    private boolean available = true;

    @Column(nullable = false)
    private boolean featured;

    @OneToMany(mappedBy = "treatment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC, id ASC")
    private List<TreatmentImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "treatment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC, id ASC")
    private List<TreatmentFaq> faqs = new ArrayList<>();
}
