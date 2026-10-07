package com.eloria.service;

import com.eloria.dto.common.PageResponse;
import com.eloria.dto.gallery.GalleryImageDto;
import com.eloria.dto.gallery.GalleryImageRequest;
import com.eloria.entity.GalleryCategory;
import com.eloria.entity.GalleryImage;
import com.eloria.exception.ResourceNotFoundException;
import com.eloria.mapper.GalleryImageMapper;
import com.eloria.repository.GalleryImageRepository;
import com.eloria.util.Text;
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
public class GalleryService {

    private static final Sort ORDER = Sort.by(Sort.Order.asc("displayOrder"), Sort.Order.desc("featured"), Sort.Order.asc("id"));

    private final GalleryImageRepository repository;
    private final GalleryImageMapper mapper;
    private final ImageReferenceService imageReferences;

    @Transactional(readOnly = true)
    public PageResponse<GalleryImageDto> list(GalleryCategory.Collection collection, GalleryCategory category,
                                              Boolean featured, String query, int page, int size) {
        Specification<GalleryImage> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            } else if (collection != null) {
                predicates.add(root.get("category").in(GalleryCategory.in(collection)));
            }
            if (featured != null) {
                predicates.add(cb.equal(root.get("featured"), featured));
            }
            String pattern = Text.likePattern(query);
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern, '\\'),
                        cb.like(cb.lower(root.get("description")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return PageResponse.from(repository.findAll(spec, PageRequest.of(page, size, ORDER)), mapper::toDto);
    }

    @Transactional(readOnly = true)
    public GalleryImageDto get(Long id) {
        return mapper.toDto(find(id));
    }

    @Transactional
    public GalleryImageDto create(GalleryImageRequest request) {
        GalleryImage image = new GalleryImage();
        mapper.apply(request, image);
        repository.save(image);
        log.info("Gallery image created: {}", image.getTitle());
        return mapper.toDto(image);
    }

    /** Full update; sending a new imageUrl replaces the photo and deletes the old upload once unused. */
    @Transactional
    public GalleryImageDto update(Long id, GalleryImageRequest request) {
        GalleryImage image = find(id);
        String previousUrl = image.getImageUrl();
        mapper.apply(request, image);
        if (!previousUrl.equals(image.getImageUrl())) {
            imageReferences.deleteUnreferencedAfterCommit(List.of(previousUrl));
        }
        return mapper.toDto(image);
    }

    @Transactional
    public void delete(Long id) {
        GalleryImage image = find(id);
        repository.delete(image);
        imageReferences.deleteUnreferencedAfterCommit(List.of(image.getImageUrl()));
        log.info("Gallery image deleted: {}", image.getTitle());
    }

    private GalleryImage find(Long id) {
        return repository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Gallery image", id));
    }
}
