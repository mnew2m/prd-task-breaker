CREATE TABLE IF NOT EXISTS prd_analysis (
    id          BIGSERIAL PRIMARY KEY,
    prd_input   TEXT         NOT NULL,
    result_json TEXT,
    status      VARCHAR(20)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL,
    completed_at TIMESTAMP
);
