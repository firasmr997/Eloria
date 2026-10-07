package com.eloria.repository;

import com.eloria.entity.TreatmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TreatmentCategoryRepository extends JpaRepository<TreatmentCategory, Long>,
        JpaSpecificationExecutor<TreatmentCategory> {

    List<TreatmentCategory> findAllByOrderByDisplayOrderAscIdAsc();

    List<TreatmentCategory> findByActiveTrueOrderByDisplayOrderAscIdAsc();

    Optional<TreatmentCategory> findBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
