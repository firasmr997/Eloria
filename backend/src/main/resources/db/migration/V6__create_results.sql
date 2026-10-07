-- Before/after cases. A deleted treatment leaves its results in place, unlinked.
CREATE TABLE results (
    id                BIGSERIAL PRIMARY KEY,
    treatment_id      BIGINT        REFERENCES treatments (id) ON DELETE SET NULL,
    before_image_url  VARCHAR(1000) NOT NULL,
    after_image_url   VARCHAR(1000) NOT NULL,
    title             VARCHAR(140)  NOT NULL,
    description       VARCHAR(1200),
    duration_label    VARCHAR(120),
    featured          BOOLEAN       NOT NULL DEFAULT FALSE,
    display_order     INTEGER       NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX ix_results_treatment ON results (treatment_id);
CREATE INDEX ix_results_order ON results (display_order, id);
