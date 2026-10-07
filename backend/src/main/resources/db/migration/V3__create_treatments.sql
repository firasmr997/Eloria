-- List-like fields (benefits, preparation, aftercare, contraindications) store one item per line.
CREATE TABLE treatments (
    id                 BIGSERIAL PRIMARY KEY,
    category_id        BIGINT        NOT NULL REFERENCES treatment_categories (id) ON DELETE RESTRICT,
    name               VARCHAR(120)  NOT NULL,
    slug               VARCHAR(140)  NOT NULL,
    short_description  VARCHAR(280)  NOT NULL,
    description        TEXT          NOT NULL,
    duration_minutes   INTEGER       NOT NULL CHECK (duration_minutes BETWEEN 5 AND 600),
    sessions           VARCHAR(120),
    downtime           VARCHAR(120),
    price              NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    price_from         BOOLEAN       NOT NULL DEFAULT FALSE,
    benefits           TEXT,
    preparation        TEXT,
    aftercare          TEXT,
    contraindications  TEXT,
    technology         VARCHAR(200),
    main_image_url     VARCHAR(1000),
    main_image_alt     VARCHAR(240),
    available          BOOLEAN       NOT NULL DEFAULT TRUE,
    featured           BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_treatments_slug ON treatments (slug);
CREATE INDEX ix_treatments_category ON treatments (category_id);
CREATE INDEX ix_treatments_featured ON treatments (featured) WHERE featured;

CREATE TABLE treatment_faqs (
    id            BIGSERIAL PRIMARY KEY,
    treatment_id  BIGINT       NOT NULL REFERENCES treatments (id) ON DELETE CASCADE,
    question      VARCHAR(300) NOT NULL,
    answer        TEXT         NOT NULL,
    position      INTEGER      NOT NULL DEFAULT 0
);

CREATE INDEX ix_treatment_faqs_treatment ON treatment_faqs (treatment_id, position);
