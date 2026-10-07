package com.eloria.entity;

import java.util.Arrays;
import java.util.List;

/**
 * Photo categories. {@link Collection#EDITORIAL} categories feed the main gallery, {@link Collection#CENTER}
 * categories feed "The Center" gallery of the premises.
 */
public enum GalleryCategory {
    TREATMENTS(Collection.EDITORIAL),
    SKIN(Collection.EDITORIAL),
    BEAUTY(Collection.EDITORIAL),
    ATMOSPHERE(Collection.EDITORIAL),
    RECEPTION(Collection.CENTER),
    TREATMENT_ROOMS(Collection.CENTER),
    WAITING_AREA(Collection.CENTER),
    EQUIPMENT(Collection.CENTER),
    INTERIOR(Collection.CENTER),
    EXTERIOR(Collection.CENTER),
    DETAILS(Collection.CENTER),
    TEAM(Collection.CENTER);

    public enum Collection { EDITORIAL, CENTER }

    private final Collection collection;

    GalleryCategory(Collection collection) {
        this.collection = collection;
    }

    public Collection collection() {
        return collection;
    }

    public static List<GalleryCategory> in(Collection collection) {
        return Arrays.stream(values()).filter(c -> c.collection == collection).toList();
    }
}
