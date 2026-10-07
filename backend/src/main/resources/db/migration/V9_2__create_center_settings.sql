-- Single-row profile of the center (address, hours, channels), edited from Admin > Settings.
-- Opening hours store one "Label|Hours" pair per line, e.g. "Monday – Friday|9:00 – 20:00".
CREATE TABLE center_settings (
    id              BIGINT        PRIMARY KEY CHECK (id = 1),
    center_name     VARCHAR(120)  NOT NULL,
    tagline         VARCHAR(200),
    address_line    VARCHAR(200),
    postal_code     VARCHAR(20),
    city            VARCHAR(80),
    country         VARCHAR(80),
    phone           VARCHAR(40),
    email           VARCHAR(255),
    opening_hours   TEXT,
    instagram_url   VARCHAR(300),
    facebook_url    VARCHAR(300),
    pinterest_url   VARCHAR(300),
    map_url         VARCHAR(600),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

INSERT INTO center_settings (id, center_name, tagline) VALUES (1, 'ÉLORIA AESTHETIC', 'Aesthetic medicine & skin care');
