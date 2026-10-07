package com.eloria.service;

import com.eloria.dto.settings.SettingsDto;
import com.eloria.dto.settings.SettingsRequest;
import com.eloria.entity.CenterSettings;
import com.eloria.mapper.SettingsMapper;
import com.eloria.repository.CenterSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsService {

    private final CenterSettingsRepository repository;
    private final SettingsMapper mapper;

    @Transactional(readOnly = true)
    public SettingsDto get() {
        return mapper.toDto(load());
    }

    @Transactional
    public SettingsDto update(SettingsRequest request) {
        CenterSettings settings = load();
        mapper.apply(request, settings);
        log.info("Center settings updated");
        return mapper.toDto(settings);
    }

    /** The row is created by migration V9_2; recreate it defensively if someone deleted it by hand. */
    private CenterSettings load() {
        return repository.findById(CenterSettings.SINGLETON_ID).orElseGet(() -> {
            CenterSettings settings = new CenterSettings();
            settings.setCenterName("ÉLORIA AESTHETIC");
            return repository.save(settings);
        });
    }
}
