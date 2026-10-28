import { Router, type Request, type Response } from 'express';
import { validateBody, validateParams } from '../../middlewares/validate';
import { sendSuccess } from '../../utils/response';
import * as markService from '../mark/mark.service';
import {
  createStudentDto,
  studentIdParamDto,
  updateStudentDto,
  type CreateStudentDto,
  type StudentIdParamDto,
  type UpdateStudentDto,
} from './student.dto';
import * as studentService from './student.service';

/**
 * Controller + router for /students. Handlers translate HTTP <-> service calls.
 * No business logic and no try/catch: thrown errors and rejected promises
 * go to the central error handler (Express 5).
 */
const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  sendSuccess(res, await studentService.findAllStudents(), 'Students fetched successfully');
});

/** Optional extension: marks belonging to one student. */
router.get(
  '/:studentId/marks',
  validateParams(studentIdParamDto),
  async (_req: Request, res: Response) => {
    const { studentId } = res.locals.params as StudentIdParamDto;
    sendSuccess(res, await markService.findMarksByStudentId(studentId), 'Student marks fetched successfully');
  },
);

router.get('/:studentId', validateParams(studentIdParamDto), async (_req: Request, res: Response) => {
  const { studentId } = res.locals.params as StudentIdParamDto;
  sendSuccess(res, await studentService.findStudentById(studentId), 'Student fetched successfully');
});

router.post(
  '/',
  validateBody(createStudentDto),
  async (req: Request<unknown, unknown, CreateStudentDto>, res: Response) => {
    sendSuccess(res, await studentService.createStudent(req.body), 'Student created successfully', 201);
  },
);

router.put(
  '/:studentId',
  validateParams(studentIdParamDto),
  validateBody(updateStudentDto),
  async (req: Request<{ studentId: string }, unknown, UpdateStudentDto>, res: Response) => {
    const { studentId } = res.locals.params as StudentIdParamDto;
    sendSuccess(res, await studentService.updateStudent(studentId, req.body), 'Student updated successfully');
  },
);

router.delete('/:studentId', validateParams(studentIdParamDto), async (_req: Request, res: Response) => {
  const { studentId } = res.locals.params as StudentIdParamDto;
  await studentService.deleteStudent(studentId);
  res.status(204).send();
});

export default router;
