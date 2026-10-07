package com.eloria.service;

import com.eloria.dto.testimonial.TestimonialDto;
import com.eloria.dto.testimonial.TestimonialRequest;
import com.eloria.entity.Testimonial;
import com.eloria.exception.ResourceNotFoundException;
import com.eloria.mapper.TestimonialMapper;
import com.eloria.repository.TestimonialRepository;
import com.eloria.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestimonialService {

    private final TestimonialRepository repository;
    private final TestimonialMapper mapper;

    /** Visitors get published testimonials; staff may include unpublished ones. */
    @Transactional(readOnly = true)
    public List<TestimonialDto> list(boolean includeUnpublished) {
        List<Testimonial> testimonials = includeUnpublished && CurrentUser.isStaff()
                ? repository.findAllByOrderByDisplayOrderAscIdAsc()
                : repository.findByPublishedTrueOrderByDisplayOrderAscIdAsc();
        return testimonials.stream().map(mapper::toDto).toList();
    }

    @Transactional
    public TestimonialDto create(TestimonialRequest request) {
        Testimonial testimonial = new Testimonial();
        mapper.apply(request, testimonial);
        return mapper.toDto(repository.save(testimonial));
    }

    @Transactional
    public TestimonialDto update(Long id, TestimonialRequest request) {
        Testimonial testimonial = find(id);
        mapper.apply(request, testimonial);
        return mapper.toDto(testimonial);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(find(id));
    }

    private Testimonial find(Long id) {
        return repository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Testimonial", id));
    }
}
