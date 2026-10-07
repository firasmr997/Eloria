package com.eloria.repository.spec;

import com.eloria.entity.Treatment;
import com.eloria.entity.TreatmentCategory;
import com.eloria.util.Text;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/** Composable filters for the treatment catalogue. */
public final class TreatmentSpecifications {

    private static final char ESCAPE = '\\';

    private TreatmentSpecifications() {
    }

    public static Specification<Treatment> filter(TreatmentFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<Treatment, TreatmentCategory> category = root.join("category", JoinType.INNER);

            if (!filter.includeInactiveCategories()) {
                predicates.add(cb.isTrue(category.get("active")));
            }
            if (filter.categoryId() != null) {
                predicates.add(cb.equal(category.get("id"), filter.categoryId()));
            }
            if (filter.categorySlug() != null) {
                predicates.add(cb.equal(category.get("slug"), filter.categorySlug()));
            }
            if (filter.available() != null) {
                predicates.add(cb.equal(root.get("available"), filter.available()));
            }
            if (filter.featured() != null) {
                predicates.add(cb.equal(root.get("featured"), filter.featured()));
            }
            String pattern = Text.likePattern(filter.query());
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, ESCAPE),
                        cb.like(cb.lower(root.get("shortDescription")), pattern, ESCAPE),
                        cb.like(cb.lower(root.get("description")), pattern, ESCAPE),
                        cb.like(cb.lower(root.get("technology")), pattern, ESCAPE),
                        cb.like(cb.lower(category.get("name")), pattern, ESCAPE)));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    /**
     * @param query                     free text matched against name, descriptions, technology and category name
     * @param includeInactiveCategories staff-only: also return treatments whose category is hidden
     */
    public record TreatmentFilter(
            String query,
            Long categoryId,
            String categorySlug,
            Boolean available,
            Boolean featured,
            boolean includeInactiveCategories) {
    }
}
