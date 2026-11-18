-- Distinguish submissions for Excel-imported tasks from mentor_tasks.
ALTER TABLE mentor_task_submissions
    ADD COLUMN IF NOT EXISTS task_source VARCHAR(16) NOT NULL DEFAULT 'mentor';

ALTER TABLE mentor_task_submissions
    DROP CONSTRAINT IF EXISTS mentor_task_submissions_task_id_fkey;

CREATE TABLE IF NOT EXISTS excel_task_submissions (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    talent_id BIGINT NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_excel_task_submissions_task
    ON excel_task_submissions(task_id);

CREATE INDEX IF NOT EXISTS idx_excel_task_submissions_talent
    ON excel_task_submissions(talent_id);
