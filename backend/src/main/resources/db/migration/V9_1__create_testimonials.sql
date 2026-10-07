-- Client testimonials shown on the home page. Only published ones are public.
CREATE TABLE testimonials (
    id              BIGSERIAL PRIMARY KEY,
    author_name     VARCHAR(120)  NOT NULL,
    author_detail   VARCHAR(160),
    quote           VARCHAR(1200) NOT NULL,
    treatment_name  VARCHAR(120),
    display_order   INTEGER       NOT NULL DEFAULT 0,
    published       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);
