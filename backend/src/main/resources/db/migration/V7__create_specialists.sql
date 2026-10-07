-- Specialties store one item per line.
CREATE TABLE specialists (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(120)  NOT NULL,
    slug           VARCHAR(140)  NOT NULL,
    role           VARCHAR(140)  NOT NULL,
    bio            TEXT          NOT NULL,
    photo          VARCHAR(1000),
    experience     VARCHAR(80),
    specialties    TEXT,
    instagram_url  VARCHAR(300),
    linkedin_url   VARCHAR(300),
    display_order  INTEGER       NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_specialists_slug ON specialists (slug);
