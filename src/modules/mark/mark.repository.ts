import { pool } from '../../config/db';
import type { CreateMarkDto, ListMarksQueryDto, UpdateMarkDto } from './mark.dto';
import type { MarkRow, SubjectAverageRow } from './mark.interface';

const COLUMNS = 'id, student_id, subject, marks, created_at, updated_at';

export const findAll = async (filters: ListMarksQueryDto = {}): Promise<MarkRow[]> => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (filters.studentId !== undefined) {
    conditions.push(`student_id = $${i++}`);
    values.push(filters.studentId);
  }
  if (filters.subject !== undefined) {
    conditions.push(`LOWER(subject) = LOWER($${i++})`);
    values.push(filters.subject);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query<MarkRow>(
    `SELECT ${COLUMNS} FROM marks ${where} ORDER BY id ASC`,
    values,
  );
  return rows;
};

export const findById = async (id: number): Promise<MarkRow | null> => {
  const { rows } = await pool.query<MarkRow>(`SELECT ${COLUMNS} FROM marks WHERE id = $1`, [id]);
  return rows[0] ?? null;
};

export const findByStudentId = async (studentId: number): Promise<MarkRow[]> => {
  const { rows } = await pool.query<MarkRow>(
    `SELECT ${COLUMNS} FROM marks WHERE student_id = $1 ORDER BY subject ASC`,
    [studentId],
  );
  return rows;
};

export const create = async (dto: CreateMarkDto): Promise<MarkRow> => {
  const { rows } = await pool.query<MarkRow>(
    `INSERT INTO marks (student_id, subject, marks)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [dto.studentId, dto.subject, dto.marks],
  );
  return rows[0]!;
};

export const update = async (id: number, dto: UpdateMarkDto): Promise<MarkRow | null> => {
  const { rows } = await pool.query<MarkRow>(
    `UPDATE marks
        SET student_id = $2,
            subject = $3,
            marks = $4,
            updated_at = NOW()
      WHERE id = $1
  RETURNING ${COLUMNS}`,
    [id, dto.studentId, dto.subject, dto.marks],
  );
  return rows[0] ?? null;
};

export const remove = async (id: number): Promise<boolean> => {
  const { rowCount } = await pool.query('DELETE FROM marks WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
};

/**
 * Arithmetic mean per subject, rounded to 2 decimal places in SQL.
 * Missing marks are never counted as zero — only recorded rows contribute.
 */
export const getSubjectAverages = async (): Promise<SubjectAverageRow[]> => {
  const { rows } = await pool.query<SubjectAverageRow>(
    `SELECT
       MIN(subject) AS subject,
       ROUND(AVG(marks)::numeric, 2) AS average_marks,
       COUNT(*)::int AS total_records
     FROM marks
     GROUP BY LOWER(subject)
     ORDER BY MIN(subject) ASC`,
  );
  return rows;
};
