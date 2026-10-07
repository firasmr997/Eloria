package com.eloria.repository;

import com.eloria.entity.Result;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Long>, JpaSpecificationExecutor<Result> {

    @Override
    @EntityGraph(attributePaths = "treatment")
    Page<Result> findAll(Specification<Result> spec, Pageable pageable);

    @EntityGraph(attributePaths = "treatment")
    Optional<Result> findWithTreatmentById(Long id);

    boolean existsByBeforeImageUrl(String url);

    boolean existsByAfterImageUrl(String url);
}
