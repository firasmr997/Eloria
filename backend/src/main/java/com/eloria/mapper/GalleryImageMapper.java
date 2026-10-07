package com.eloria.mapper;

import com.eloria.dto.gallery.GalleryImageDto;
import com.eloria.dto.gallery.GalleryImageRequest;
import com.eloria.entity.GalleryImage;
import com.eloria.util.Text;
import org.springframework.stereotype.Component;

@Component
public class GalleryImageMapper {

    public GalleryImageDto toDto(GalleryImage image) {
        return new GalleryImageDto(image.getId(), image.getTitle(), image.getDescription(), image.getImageUrl(),
                image.getCategory(), image.getCategory().collection(), image.getDisplayOrder(), image.isFeatured(),
                image.getCreatedAt(), image.getUpdatedAt());
    }

    public void apply(GalleryImageRequest request, GalleryImage image) {
        image.setTitle(request.title().trim());
        image.setDescription(Text.clean(request.description()));
        image.setImageUrl(request.imageUrl().trim());
        image.setCategory(request.category());
        image.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        image.setFeatured(Boolean.TRUE.equals(request.featured()));
    }
}
