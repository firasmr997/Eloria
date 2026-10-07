package com.eloria.mapper;

import com.eloria.dto.specialist.SpecialistDto;
import com.eloria.dto.specialist.SpecialistRequest;
import com.eloria.entity.Specialist;
import com.eloria.util.Text;
import org.springframework.stereotype.Component;

@Component
public class SpecialistMapper {

    public SpecialistDto toDto(Specialist s) {
        return new SpecialistDto(s.getId(), s.getName(), s.getSlug(), s.getRole(), s.getBio(), s.getPhoto(),
                s.getExperience(), Text.lines(s.getSpecialties()),
                new SpecialistDto.SocialLinks(s.getInstagramUrl(), s.getLinkedinUrl()),
                s.getDisplayOrder(), s.getCreatedAt(), s.getUpdatedAt());
    }

    /** Copies request fields; the slug is handled by the service. */
    public void apply(SpecialistRequest r, Specialist s) {
        s.setName(r.name().trim());
        s.setRole(r.role().trim());
        s.setBio(r.bio().trim());
        s.setPhoto(Text.clean(r.photo()));
        s.setExperience(Text.clean(r.experience()));
        s.setSpecialties(Text.joinLines(r.specialties()));
        s.setInstagramUrl(Text.clean(r.instagramUrl()));
        s.setLinkedinUrl(Text.clean(r.linkedinUrl()));
        s.setDisplayOrder(r.displayOrder() == null ? 0 : r.displayOrder());
    }
}
