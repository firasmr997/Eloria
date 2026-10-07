package com.eloria.mapper;

import com.eloria.dto.testimonial.TestimonialDto;
import com.eloria.dto.testimonial.TestimonialRequest;
import com.eloria.entity.Testimonial;
import com.eloria.util.Text;
import org.springframework.stereotype.Component;

@Component
public class TestimonialMapper {

    public TestimonialDto toDto(Testimonial t) {
        return new TestimonialDto(t.getId(), t.getAuthorName(), t.getAuthorDetail(), t.getQuote(), t.getTreatmentName(),
                t.getDisplayOrder(), t.isPublished(), t.getCreatedAt(), t.getUpdatedAt());
    }

    public void apply(TestimonialRequest r, Testimonial t) {
        t.setAuthorName(r.authorName().trim());
        t.setAuthorDetail(Text.clean(r.authorDetail()));
        t.setQuote(r.quote().trim());
        t.setTreatmentName(Text.clean(r.treatmentName()));
        t.setDisplayOrder(r.displayOrder() == null ? 0 : r.displayOrder());
        t.setPublished(r.published() == null || r.published());
    }
}
