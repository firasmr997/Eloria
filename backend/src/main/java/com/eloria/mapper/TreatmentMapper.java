package com.eloria.mapper;

import com.eloria.dto.treatment.TreatmentDto;
import com.eloria.dto.treatment.TreatmentRefDto;
import com.eloria.dto.treatment.TreatmentRequest;
import com.eloria.dto.treatment.TreatmentSummaryDto;
import com.eloria.entity.Treatment;
import com.eloria.entity.TreatmentFaq;
import com.eloria.entity.TreatmentImage;
import com.eloria.util.Text;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TreatmentMapper {

    private final CategoryMapper categoryMapper;

    public TreatmentSummaryDto toSummary(Treatment t) {
        return new TreatmentSummaryDto(t.getId(), t.getName(), t.getSlug(), t.getShortDescription(),
                categoryMapper.toRef(t.getCategory()), t.getDurationMinutes(), t.getPrice(), t.isPriceFrom(),
                t.getTechnology(), t.getMainImageUrl(), t.getMainImageAlt(), t.isAvailable(), t.isFeatured(),
                t.getUpdatedAt());
    }

    public TreatmentDto toDto(Treatment t) {
        return new TreatmentDto(t.getId(), t.getName(), t.getSlug(), t.getShortDescription(), t.getDescription(),
                categoryMapper.toRef(t.getCategory()), t.getDurationMinutes(), t.getSessions(), t.getDowntime(),
                t.getPrice(), t.isPriceFrom(),
                Text.lines(t.getBenefits()), Text.lines(t.getPreparation()), Text.lines(t.getAftercare()),
                Text.lines(t.getContraindications()), t.getTechnology(), t.getMainImageUrl(), t.getMainImageAlt(),
                t.getImages().stream().map(i -> new TreatmentDto.ImageDto(i.getId(), i.getImageUrl(), i.getAltText())).toList(),
                t.getFaqs().stream().map(f -> new TreatmentDto.FaqDto(f.getId(), f.getQuestion(), f.getAnswer())).toList(),
                t.isAvailable(), t.isFeatured(), t.getCreatedAt(), t.getUpdatedAt());
    }

    public TreatmentRefDto toRef(Treatment t) {
        return t == null ? null : new TreatmentRefDto(t.getId(), t.getName(), t.getSlug());
    }

    /** Copies scalar fields and replaces the image and FAQ collections; category and slug are set by the service. */
    public void apply(TreatmentRequest r, Treatment t) {
        t.setName(r.name().trim());
        t.setShortDescription(r.shortDescription().trim());
        t.setDescription(r.description().trim());
        t.setDurationMinutes(r.durationMinutes());
        t.setSessions(Text.clean(r.sessions()));
        t.setDowntime(Text.clean(r.downtime()));
        t.setPrice(r.price());
        t.setPriceFrom(Boolean.TRUE.equals(r.priceFrom()));
        t.setBenefits(Text.joinLines(r.benefits()));
        t.setPreparation(Text.joinLines(r.preparation()));
        t.setAftercare(Text.joinLines(r.aftercare()));
        t.setContraindications(Text.joinLines(r.contraindications()));
        t.setTechnology(Text.clean(r.technology()));
        t.setMainImageUrl(Text.clean(r.mainImageUrl()));
        t.setMainImageAlt(Text.clean(r.mainImageAlt()));
        t.setAvailable(r.available() == null || r.available());
        t.setFeatured(Boolean.TRUE.equals(r.featured()));

        t.getImages().clear();
        List<TreatmentRequest.ImageRequest> images = r.additionalImages() == null ? List.of() : r.additionalImages();
        for (int i = 0; i < images.size(); i++) {
            TreatmentImage image = new TreatmentImage();
            image.setTreatment(t);
            image.setImageUrl(images.get(i).imageUrl().trim());
            image.setAltText(Text.clean(images.get(i).altText()));
            image.setPosition(i);
            t.getImages().add(image);
        }

        t.getFaqs().clear();
        List<TreatmentRequest.FaqRequest> faqs = r.faqs() == null ? List.of() : r.faqs();
        for (int i = 0; i < faqs.size(); i++) {
            TreatmentFaq faq = new TreatmentFaq();
            faq.setTreatment(t);
            faq.setQuestion(faqs.get(i).question().trim());
            faq.setAnswer(faqs.get(i).answer().trim());
            faq.setPosition(i);
            t.getFaqs().add(faq);
        }
    }
}
