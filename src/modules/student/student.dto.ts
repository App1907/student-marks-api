import { z } from 'zod';

/* ---------- Request DTOs (validated at the edge) ---------- */

export const createStudentDto = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    email: z.email('Invalid email format').trim().toLowerCase(),
  })
  .strict();
export type CreateStudentDto = z.infer<typeof createStudentDto>;

export const updateStudentDto = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    email: z.email('Invalid email format').trim().toLowerCase(),
  })
  .strict();
export type UpdateStudentDto = z.infer<typeof updateStudentDto>;

const positiveId = (field: string) =>
  z
    .string()
    .regex(/^\d+$/, `${field} must be a positive integer`)
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, `${field} must be a positive integer`);

export const studentIdParamDto = z.object({
  studentId: positiveId('studentId'),
});
export type StudentIdParamDto = z.infer<typeof studentIdParamDto>;

/* ---------- Response DTO ---------- */

export interface StudentResponseDto {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
