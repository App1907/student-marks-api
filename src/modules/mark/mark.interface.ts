/** A row from the `marks` table, as returned by pg (snake_case columns). */
export interface MarkRow {
  id: number;
  student_id: number;
  subject: string;
  marks: string; // pg NUMERIC comes back as string
  created_at: Date;
  updated_at: Date;
}

/** Aggregated subject average row from SQL. */
export interface SubjectAverageRow {
  subject: string;
  average_marks: string;
  total_records: string | number;
}

/** Internal domain shape for a mark. */
export interface Mark {
  id: number;
  studentId: number;
  subject: string;
  marks: number;
  createdAt: Date;
  updatedAt: Date;
}
