package com.eloria.mapper;

import com.eloria.dto.settings.SettingsDto;
import com.eloria.dto.settings.SettingsRequest;
import com.eloria.entity.CenterSettings;
import com.eloria.util.Text;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SettingsMapper {

    public SettingsDto toDto(CenterSettings s) {
        List<SettingsDto.HoursLine> hours = Text.lines(s.getOpeningHours()).stream()
                .map(line -> {
                    int bar = line.indexOf('|');
                    return bar < 0 ? new SettingsDto.HoursLine(line, "")
                            : new SettingsDto.HoursLine(line.substring(0, bar).trim(), line.substring(bar + 1).trim());
                })
                .toList();
        return new SettingsDto(s.getCenterName(), s.getTagline(), s.getAddressLine(), s.getPostalCode(), s.getCity(),
                s.getCountry(), s.getPhone(), s.getEmail(), hours, s.getInstagramUrl(), s.getFacebookUrl(),
                s.getPinterestUrl(), s.getMapUrl(), s.getUpdatedAt());
    }

    public void apply(SettingsRequest r, CenterSettings s) {
        s.setCenterName(r.centerName().trim());
        s.setTagline(Text.clean(r.tagline()));
        s.setAddressLine(Text.clean(r.addressLine()));
        s.setPostalCode(Text.clean(r.postalCode()));
        s.setCity(Text.clean(r.city()));
        s.setCountry(Text.clean(r.country()));
        s.setPhone(Text.clean(r.phone()));
        s.setEmail(Text.clean(r.email()));
        s.setOpeningHours(r.openingHours() == null ? null : Text.joinLines(r.openingHours().stream()
                .map(h -> h.label().trim() + "|" + h.hours().trim())
                .toList()));
        s.setInstagramUrl(Text.clean(r.instagramUrl()));
        s.setFacebookUrl(Text.clean(r.facebookUrl()));
        s.setPinterestUrl(Text.clean(r.pinterestUrl()));
        s.setMapUrl(Text.clean(r.mapUrl()));
    }
}
