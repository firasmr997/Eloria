package com.eloria.dto.treatment;

/** Minimal treatment reference for select boxes (booking form, admin pickers). */
public record TreatmentOptionDto(Long id, String name, String slug, String categoryName) {
}
