import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import { roleMiddleware } from '../middlewares/auth.middleware';

import { SubmissionController } from '../controllers/submission.controller';

export const submissionRouter = Router();

submissionRouter.get('/', SubmissionController.index);
submissionRouter.get('/:id', SubmissionController.show);
submissionRouter.post(
  '/',
  roleMiddleware(Role.STUDENT),
  SubmissionController.store,
);
