CREATE TABLE treatment_categories (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(80)  NOT NULL,
    slug           VARCHAR(100) NOT NULL,
    description    VARCHAR(600),
    display_order  INTEGER      NOT NULL DEFAULT 0,
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_treatment_categories_name ON treatment_categories (lower(name));
CREATE UNIQUE INDEX ux_treatment_categories_slug ON treatment_categories (slug);
CREATE INDEX ix_treatment_categories_order ON treatment_categories (display_order, id);
