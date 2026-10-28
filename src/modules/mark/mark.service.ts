import { DatabaseError } from 'pg';
import { badRequest, conflict, notFound } from '../../errors/AppError';
import * as studentRepository from '../student/student.repository';
import type {
  CreateMarkDto,
  ListMarksQueryDto,
  MarkResponseDto,
  SubjectAverageDto,
  UpdateMarkDto,
} from './mark.dto';
import type { MarkRow } from './mark.interface';
import * as markRepository from './mark.repository';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_CHECK_VIOLATION = '23514';

const toResponse = (row: MarkRow): MarkResponseDto => ({
  id: row.id,
  studentId: row.student_id,
  subject: row.subject,
  marks: Number(row.marks),
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

const assertStudentExists = async (studentId: number): Promise<void> => {
  const student = await studentRepository.findById(studentId);
  if (!student) throw notFound(`Student ${studentId} not found`);
};

/** Maps known Postgres constraint errors to AppError; rethrows anything else. */
const handleDbError = (err: unknown): never => {
  if (err instanceof DatabaseError) {
    if (err.code === PG_UNIQUE_VIOLATION) {
      throw conflict('A mark for this student and subject already exists');
    }
    if (err.code === PG_FOREIGN_KEY_VIOLATION) {
      throw notFound('Referenced student does not exist');
    }
    if (err.code === PG_CHECK_VIOLATION) {
      throw badRequest('marks must be a number between 0 and 100 inclusive');
    }
  }
  throw err;
};

export const findAllMarks = async (filters: ListMarksQueryDto = {}): Promise<MarkResponseDto[]> => {
  const rows = await markRepository.findAll(filters);
  return rows.map(toResponse);
};

export const findMarkById = async (id: number): Promise<MarkResponseDto> => {
  const row = await markRepository.findById(id);
  if (!row) throw notFound(`Mark ${id} not found`);
  return toResponse(row);
};

export const findMarksByStudentId = async (studentId: number): Promise<MarkResponseDto[]> => {
  await assertStudentExists(studentId);
  const rows = await markRepository.findByStudentId(studentId);
  return rows.map(toResponse);
};

export const createMark = async (dto: CreateMarkDto): Promise<MarkResponseDto> => {
  await assertStudentExists(dto.studentId);
  try {
    const row = await markRepository.create(dto);
    return toResponse(row);
  } catch (err) {
    return handleDbError(err);
  }
};

export const updateMark = async (id: number, dto: UpdateMarkDto): Promise<MarkResponseDto> => {
  await assertStudentExists(dto.studentId);
  try {
    const row = await markRepository.update(id, dto);
    if (!row) throw notFound(`Mark ${id} not found`);
    return toResponse(row);
  } catch (err) {
    return handleDbError(err);
  }
};

export const deleteMark = async (id: number): Promise<void> => {
  const deleted = await markRepository.remove(id);
  if (!deleted) throw notFound(`Mark ${id} not found`);
};

/**
 * Subject-wise arithmetic means. Empty marks table => empty list.
 * averageMarks is always rounded to two decimal places.
 */
export const getSubjectAverages = async (): Promise<SubjectAverageDto[]> => {
  const rows = await markRepository.getSubjectAverages();
  return rows.map((row) => ({
    subject: row.subject,
    averageMarks: Number(Number(row.average_marks).toFixed(2)),
    totalRecords: Number(row.total_records),
  }));
};
