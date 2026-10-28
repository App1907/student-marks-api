import { z } from 'zod';

/* ---------- Request DTOs (validated at the edge) ---------- */

const marksValue = z
  .number({ error: 'marks must be a number' })
  .finite('marks must be a finite number')
  .min(0, 'marks must be at least 0')
  .max(100, 'marks must be at most 100');

export const createMarkDto = z
  .object({
    studentId: z.number({ error: 'studentId must be a number' }).int().positive('studentId must be a positive integer'),
    subject: z.string().trim().min(1, 'Subject is required').max(100),
    marks: marksValue,
  })
  .strict();
export type CreateMarkDto = z.infer<typeof createMarkDto>;

export const updateMarkDto = z
  .object({
    studentId: z.number({ error: 'studentId must be a number' }).int().positive('studentId must be a positive integer'),
    subject: z.string().trim().min(1, 'Subject is required').max(100),
    marks: marksValue,
  })
  .strict();
export type UpdateMarkDto = z.infer<typeof updateMarkDto>;

const positiveId = (field: string) =>
  z
    .string()
    .regex(/^\d+$/, `${field} must be a positive integer`)
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, `${field} must be a positive integer`);

export const markIdParamDto = z.object({
  markId: positiveId('markId'),
});
export type MarkIdParamDto = z.infer<typeof markIdParamDto>;

/** Query filters — unknown keys are ignored (not .strict) so clients can pass extra params. */
export const listMarksQueryDto = z.object({
  studentId: z
    .string()
    .regex(/^\d+$/, 'studentId must be a positive integer')
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, 'studentId must be a positive integer')
    .optional(),
  subject: z.string().trim().min(1).max(100).optional(),
});
export type ListMarksQueryDto = z.infer<typeof listMarksQueryDto>;

/* ---------- Response DTOs ---------- */

export interface MarkResponseDto {
  id: number;
  studentId: number;
  subject: string;
  marks: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectAverageDto {
  subject: string;
  averageMarks: number;
  totalRecords: number;
}
