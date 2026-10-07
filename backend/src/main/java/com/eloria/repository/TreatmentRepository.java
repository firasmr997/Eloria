package com.eloria.repository;

import com.eloria.entity.Treatment;
import com.eloria.entity.TreatmentCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TreatmentRepository extends JpaRepository<Treatment, Long>, JpaSpecificationExecutor<Treatment> {

    /** Search results always render the category, so fetch it with the page. */
    @Override
    @EntityGraph(attributePaths = "category")
    Page<Treatment> findAll(Specification<Treatment> spec, Pageable pageable);

    @EntityGraph(attributePaths = "category")
    Optional<Treatment> findWithCategoryById(Long id);

    @EntityGraph(attributePaths = "category")
    Optional<Treatment> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    long countByCategoryId(Long categoryId);

    long countByFeaturedTrue();

    long countByAvailableTrue();

    boolean existsByMainImageUrl(String url);

    @Query("select t.category.id as categoryId, count(t) as total from Treatment t group by t.category.id")
    List<CategoryCount> countPerCategory();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Treatment t set t.category = :target where t.category = :source")
    int reassignCategory(@Param("source") TreatmentCategory source, @Param("target") TreatmentCategory target);

    /** Lightweight id/name pairs for selects (booking form, admin pickers). */
    @Query("select t.id as id, t.name as name, t.slug as slug, c.name as categoryName from Treatment t "
            + "join t.category c where (:includeUnavailable = true or (t.available = true and c.active = true)) "
            + "order by c.displayOrder, c.id, t.name")
    List<TreatmentOption> findOptions(@Param("includeUnavailable") boolean includeUnavailable);

    interface CategoryCount {
        Long getCategoryId();

        long getTotal();
    }

    interface TreatmentOption {
        Long getId();

        String getName();

        String getSlug();

        String getCategoryName();
    }
}
