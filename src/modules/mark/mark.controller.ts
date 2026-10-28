import { Router, type Request, type Response } from 'express';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate';
import { sendSuccess } from '../../utils/response';
import {
  createMarkDto,
  listMarksQueryDto,
  markIdParamDto,
  updateMarkDto,
  type CreateMarkDto,
  type ListMarksQueryDto,
  type MarkIdParamDto,
  type UpdateMarkDto,
} from './mark.dto';
import * as markService from './mark.service';

/**
 * Controller + router for /marks. Handlers translate HTTP <-> service calls.
 * Static paths (averages) are registered before /:markId so they are not
 * captured as IDs.
 */
const router = Router();

router.get('/averages/subjects', async (_req: Request, res: Response) => {
  sendSuccess(res, await markService.getSubjectAverages(), 'Subject averages fetched successfully');
});

router.get('/', validateQuery(listMarksQueryDto), async (_req: Request, res: Response) => {
  const filters = res.locals.query as ListMarksQueryDto;
  sendSuccess(res, await markService.findAllMarks(filters), 'Marks fetched successfully');
});

router.get('/:markId', validateParams(markIdParamDto), async (_req: Request, res: Response) => {
  const { markId } = res.locals.params as MarkIdParamDto;
  sendSuccess(res, await markService.findMarkById(markId), 'Mark fetched successfully');
});

router.post(
  '/',
  validateBody(createMarkDto),
  async (req: Request<unknown, unknown, CreateMarkDto>, res: Response) => {
    sendSuccess(res, await markService.createMark(req.body), 'Mark created successfully', 201);
  },
);

router.put(
  '/:markId',
  validateParams(markIdParamDto),
  validateBody(updateMarkDto),
  async (req: Request<{ markId: string }, unknown, UpdateMarkDto>, res: Response) => {
    const { markId } = res.locals.params as MarkIdParamDto;
    sendSuccess(res, await markService.updateMark(markId, req.body), 'Mark updated successfully');
  },
);

router.delete('/:markId', validateParams(markIdParamDto), async (_req: Request, res: Response) => {
  const { markId } = res.locals.params as MarkIdParamDto;
  await markService.deleteMark(markId);
  res.status(204).send();
});

export default router;
