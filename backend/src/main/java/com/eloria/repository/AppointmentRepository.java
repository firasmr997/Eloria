package com.eloria.repository;

import com.eloria.entity.Appointment;
import com.eloria.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long>, JpaSpecificationExecutor<Appointment> {

    @Override
    @EntityGraph(attributePaths = "treatment")
    Page<Appointment> findAll(Specification<Appointment> spec, Pageable pageable);

    long countByStatus(AppointmentStatus status);

    @Query("select a.createdAt from Appointment a where a.createdAt >= :since")
    List<Instant> findCreatedSince(@Param("since") Instant since);

    @Query("select coalesce(a.treatmentName, 'Not specified') as name, count(a) as total from Appointment a "
            + "group by coalesce(a.treatmentName, 'Not specified') order by count(a) desc")
    List<NamedCount> countByTreatmentName(Pageable pageable);

    interface NamedCount {
        String getName();

        long getTotal();
    }
}
