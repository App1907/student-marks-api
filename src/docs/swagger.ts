import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Student & Marks API',
    version: '1.0.0',
    description:
      'CRUD APIs for students and marks, plus subject-wise average marks. Built with Express 5 + TypeScript + PostgreSQL.',
  },
  servers: [{ url: '/api', description: 'API base path' }],
  tags: [
    { name: 'Health' },
    { name: 'Users' },
    { name: 'Students' },
    { name: 'Marks' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Liveness check',
        responses: {
          '200': { description: 'Server is healthy' },
        },
      },
    },
    '/students': {
      get: {
        tags: ['Students'],
        summary: 'List all students',
        responses: { '200': { description: 'List of students' } },
      },
      post: {
        tags: ['Students'],
        summary: 'Create a student',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateStudent' },
              example: { name: 'Asha Sharma', email: 'asha@example.com' },
            },
          },
        },
        responses: {
          '201': { description: 'Student created' },
          '400': { description: 'Validation failed' },
          '409': { description: 'Duplicate email' },
        },
      },
    },
    '/students/{studentId}': {
      get: {
        tags: ['Students'],
        summary: 'Get student by ID',
        parameters: [{ $ref: '#/components/parameters/StudentId' }],
        responses: {
          '200': { description: 'Student found' },
          '404': { description: 'Student not found' },
        },
      },
      put: {
        tags: ['Students'],
        summary: 'Update a student (full replace of name + email)',
        parameters: [{ $ref: '#/components/parameters/StudentId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateStudent' },
            },
          },
        },
        responses: {
          '200': { description: 'Student updated' },
          '400': { description: 'Validation failed' },
          '404': { description: 'Student not found' },
          '409': { description: 'Duplicate email' },
        },
      },
      delete: {
        tags: ['Students'],
        summary: 'Delete a student (cascades related marks)',
        parameters: [{ $ref: '#/components/parameters/StudentId' }],
        responses: {
          '204': { description: 'Deleted' },
          '404': { description: 'Student not found' },
        },
      },
    },
    '/students/{studentId}/marks': {
      get: {
        tags: ['Students'],
        summary: 'List marks for one student',
        parameters: [{ $ref: '#/components/parameters/StudentId' }],
        responses: {
          '200': { description: 'Marks for the student' },
          '404': { description: 'Student not found' },
        },
      },
    },
    '/marks': {
      get: {
        tags: ['Marks'],
        summary: 'List marks (optional filters: studentId, subject)',
        parameters: [
          {
            name: 'studentId',
            in: 'query',
            schema: { type: 'integer' },
            required: false,
          },
          {
            name: 'subject',
            in: 'query',
            schema: { type: 'string' },
            required: false,
          },
        ],
        responses: { '200': { description: 'List of marks' } },
      },
      post: {
        tags: ['Marks'],
        summary: 'Create a mark for a student + subject',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMark' },
              example: { studentId: 1, subject: 'Mathematics', marks: 88 },
            },
          },
        },
        responses: {
          '201': { description: 'Mark created' },
          '400': { description: 'Validation failed' },
          '404': { description: 'Student not found' },
          '409': { description: 'Duplicate student+subject' },
        },
      },
    },
    '/marks/averages/subjects': {
      get: {
        tags: ['Marks'],
        summary: 'Subject-wise average marks',
        responses: {
          '200': {
            description: 'Averages per subject',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Subject averages fetched successfully',
                  data: [
                    { subject: 'English', averageMarks: 60.0, totalRecords: 1 },
                    { subject: 'Mathematics', averageMarks: 80.0, totalRecords: 3 },
                    { subject: 'Science', averageMarks: 80.0, totalRecords: 2 },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/marks/{markId}': {
      get: {
        tags: ['Marks'],
        summary: 'Get mark by ID',
        parameters: [{ $ref: '#/components/parameters/MarkId' }],
        responses: {
          '200': { description: 'Mark found' },
          '404': { description: 'Mark not found' },
        },
      },
      put: {
        tags: ['Marks'],
        summary: 'Update a mark',
        parameters: [{ $ref: '#/components/parameters/MarkId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMark' },
            },
          },
        },
        responses: {
          '200': { description: 'Mark updated' },
          '400': { description: 'Validation failed' },
          '404': { description: 'Mark or student not found' },
          '409': { description: 'Duplicate student+subject' },
        },
      },
      delete: {
        tags: ['Marks'],
        summary: 'Delete a mark',
        parameters: [{ $ref: '#/components/parameters/MarkId' }],
        responses: {
          '204': { description: 'Deleted' },
          '404': { description: 'Mark not found' },
        },
      },
    },
  },
  components: {
    parameters: {
      StudentId: {
        name: 'studentId',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
      MarkId: {
        name: 'markId',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
    },
    schemas: {
      CreateStudent: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
        },
      },
      CreateMark: {
        type: 'object',
        required: ['studentId', 'subject', 'marks'],
        properties: {
          studentId: { type: 'integer', minimum: 1 },
          subject: { type: 'string', minLength: 1, maxLength: 100 },
          marks: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
    },
  },
} as const;

/** Mounts Swagger UI at /api/docs (before notFound). */
export const setupSwagger = (app: Express): void => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { explorer: true }));
};
