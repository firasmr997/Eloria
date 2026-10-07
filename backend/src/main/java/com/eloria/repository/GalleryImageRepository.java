package com.eloria.repository;

import com.eloria.entity.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long>, JpaSpecificationExecutor<GalleryImage> {

    boolean existsByImageUrl(String url);

    long countByFeaturedTrue();
}
