import { DatabaseError } from 'pg';
import { conflict, notFound } from '../../errors/AppError';
import type { CreateStudentDto, StudentResponseDto, UpdateStudentDto } from './student.dto';
import type { StudentRow } from './student.interface';
import * as studentRepository from './student.repository';

const PG_UNIQUE_VIOLATION = '23505';

const toResponse = (row: StudentRow): StudentResponseDto => ({
  id: row.id,
  name: row.name,
  email: row.email,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

/** Turns a duplicate-email DB error into a 409; rethrows anything else. */
const handleDbError = (err: unknown): never => {
  if (err instanceof DatabaseError && err.code === PG_UNIQUE_VIOLATION) {
    throw conflict('A student with that email already exists');
  }
  throw err;
};

export const findAllStudents = async (): Promise<StudentResponseDto[]> => {
  const rows = await studentRepository.findAll();
  return rows.map(toResponse);
};

export const findStudentById = async (id: number): Promise<StudentResponseDto> => {
  const row = await studentRepository.findById(id);
  if (!row) throw notFound(`Student ${id} not found`);
  return toResponse(row);
};

export const createStudent = async (dto: CreateStudentDto): Promise<StudentResponseDto> => {
  try {
    const row = await studentRepository.create(dto);
    return toResponse(row);
  } catch (err) {
    return handleDbError(err);
  }
};

export const updateStudent = async (id: number, dto: UpdateStudentDto): Promise<StudentResponseDto> => {
  try {
    const row = await studentRepository.update(id, dto);
    if (!row) throw notFound(`Student ${id} not found`);
    return toResponse(row);
  } catch (err) {
    return handleDbError(err);
  }
};

/**
 * Deletes the student. Related marks are removed by ON DELETE CASCADE
 * on marks.student_id, so no orphans remain.
 */
export const deleteStudent = async (id: number): Promise<void> => {
  const deleted = await studentRepository.remove(id);
  if (!deleted) throw notFound(`Student ${id} not found`);
};
