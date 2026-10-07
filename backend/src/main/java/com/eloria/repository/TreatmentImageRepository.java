package com.eloria.repository;

import com.eloria.entity.TreatmentImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TreatmentImageRepository extends JpaRepository<TreatmentImage, Long> {

    boolean existsByImageUrl(String url);
}
