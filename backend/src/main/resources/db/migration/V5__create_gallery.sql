-- Editorial categories (TREATMENTS, SKIN, BEAUTY, ATMOSPHERE) feed the main gallery;
-- center categories (RECEPTION ... TEAM) feed "The Center" gallery.
CREATE TABLE gallery_images (
    id             BIGSERIAL PRIMARY KEY,
    title          VARCHAR(140)  NOT NULL,
    description    VARCHAR(600),
    image_url      VARCHAR(1000) NOT NULL,
    category       VARCHAR(30)   NOT NULL CHECK (category IN (
                       'TREATMENTS', 'SKIN', 'BEAUTY', 'ATMOSPHERE',
                       'RECEPTION', 'TREATMENT_ROOMS', 'WAITING_AREA', 'EQUIPMENT',
                       'INTERIOR', 'EXTERIOR', 'DETAILS', 'TEAM')),
    display_order  INTEGER       NOT NULL DEFAULT 0,
    featured       BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX ix_gallery_images_category ON gallery_images (category, display_order, id);
