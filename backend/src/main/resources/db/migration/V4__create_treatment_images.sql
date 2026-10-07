CREATE TABLE treatment_images (
    id            BIGSERIAL PRIMARY KEY,
    treatment_id  BIGINT        NOT NULL REFERENCES treatments (id) ON DELETE CASCADE,
    image_url     VARCHAR(1000) NOT NULL,
    alt_text      VARCHAR(240),
    position      INTEGER       NOT NULL DEFAULT 0
);

CREATE INDEX ix_treatment_images_treatment ON treatment_images (treatment_id, position);
