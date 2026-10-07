package com.eloria.service;

import com.eloria.dto.common.PageResponse;
import com.eloria.dto.result.ResultDto;
import com.eloria.dto.result.ResultRequest;
import com.eloria.entity.Result;
import com.eloria.exception.BadRequestException;
import com.eloria.exception.ResourceNotFoundException;
import com.eloria.mapper.ResultMapper;
import com.eloria.repository.ResultRepository;
import com.eloria.repository.TreatmentRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResultService {

    private static final Sort ORDER = Sort.by(Sort.Order.desc("featured"), Sort.Order.asc("displayOrder"), Sort.Order.asc("id"));

    private final ResultRepository repository;
    private final TreatmentRepository treatmentRepository;
    private final ResultMapper mapper;
    private final ImageReferenceService imageReferences;

    @Transactional(readOnly = true)
    public PageResponse<ResultDto> list(Long treatmentId, Boolean featured, int page, int size) {
        Specification<Result> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (treatmentId != null) {
                predicates.add(cb.equal(root.get("treatment").get("id"), treatmentId));
            }
            if (featured != null) {
                predicates.add(cb.equal(root.get("featured"), featured));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return PageResponse.from(repository.findAll(spec, PageRequest.of(page, size, ORDER)), mapper::toDto);
    }

    @Transactional(readOnly = true)
    public ResultDto get(Long id) {
        return mapper.toDto(find(id));
    }

    @Transactional
    public ResultDto create(ResultRequest request) {
        Result result = new Result();
        apply(request, result);
        repository.save(result);
        log.info("Result created: {}", result.getTitle());
        return mapper.toDto(result);
    }

    @Transactional
    public ResultDto update(Long id, ResultRequest request) {
        Result result = find(id);
        List<String> previous = List.of(result.getBeforeImageUrl(), result.getAfterImageUrl());
        apply(request, result);
        imageReferences.deleteUnreferencedAfterCommit(previous);
        return mapper.toDto(result);
    }

    @Transactional
    public void delete(Long id) {
        Result result = find(id);
        repository.delete(result);
        imageReferences.deleteUnreferencedAfterCommit(List.of(result.getBeforeImageUrl(), result.getAfterImageUrl()));
        log.info("Result deleted: {}", result.getTitle());
    }

    private void apply(ResultRequest request, Result result) {
        mapper.apply(request, result);
        result.setTreatment(request.treatmentId() == null ? null : treatmentRepository.findById(request.treatmentId())
                .orElseThrow(() -> new BadRequestException("Treatment " + request.treatmentId() + " does not exist")));
    }

    private Result find(Long id) {
        return repository.findWithTreatmentById(id).orElseThrow(() -> ResourceNotFoundException.of("Result", id));
    }
}
