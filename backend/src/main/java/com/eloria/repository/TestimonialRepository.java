package com.eloria.repository;

import com.eloria.entity.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {

    List<Testimonial> findAllByOrderByDisplayOrderAscIdAsc();

    List<Testimonial> findByPublishedTrueOrderByDisplayOrderAscIdAsc();
}
