-- Consultation requests. treatment_name keeps what the visitor chose even if the treatment is later deleted.
CREATE TABLE appointments (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(120)  NOT NULL,
    email           VARCHAR(255)  NOT NULL,
    phone           VARCHAR(40)   NOT NULL,
    treatment_id    BIGINT        REFERENCES treatments (id) ON DELETE SET NULL,
    treatment_name  VARCHAR(120),
    preferred_date  DATE          NOT NULL,
    preferred_time  VARCHAR(5)    NOT NULL,
    message         VARCHAR(2000),
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    admin_notes     VARCHAR(2000),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX ix_appointments_status ON appointments (status, created_at DESC);
CREATE INDEX ix_appointments_date ON appointments (preferred_date);
