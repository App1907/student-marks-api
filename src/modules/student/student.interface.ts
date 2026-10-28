/** A row from the `students` table, as returned by pg (snake_case columns). */
export interface StudentRow {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

/** Internal domain shape for a student. */
export interface Student {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
