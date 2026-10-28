import { pool } from '../../config/db';
import type { CreateStudentDto, UpdateStudentDto } from './student.dto';
import type { StudentRow } from './student.interface';

const COLUMNS = 'id, name, email, created_at, updated_at';

export const findAll = async (): Promise<StudentRow[]> => {
  const { rows } = await pool.query<StudentRow>(`SELECT ${COLUMNS} FROM students ORDER BY id ASC`);
  return rows;
};

export const findById = async (id: number): Promise<StudentRow | null> => {
  const { rows } = await pool.query<StudentRow>(`SELECT ${COLUMNS} FROM students WHERE id = $1`, [id]);
  return rows[0] ?? null;
};

export const create = async (dto: CreateStudentDto): Promise<StudentRow> => {
  const { rows } = await pool.query<StudentRow>(
    `INSERT INTO students (name, email) VALUES ($1, $2) RETURNING ${COLUMNS}`,
    [dto.name, dto.email],
  );
  return rows[0]!;
};

export const update = async (id: number, dto: UpdateStudentDto): Promise<StudentRow | null> => {
  const { rows } = await pool.query<StudentRow>(
    `UPDATE students
        SET name = $2,
            email = $3,
            updated_at = NOW()
      WHERE id = $1
  RETURNING ${COLUMNS}`,
    [id, dto.name, dto.email],
  );
  return rows[0] ?? null;
};

export const remove = async (id: number): Promise<boolean> => {
  const { rowCount } = await pool.query('DELETE FROM students WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
};
