import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

import { SubmissionController } from '../controllers/submission.controller';

export const submissionRouter = Router();

submissionRouter.get('/', authMiddleware, SubmissionController.index);
submissionRouter.get('/:id', authMiddleware, SubmissionController.show);
submissionRouter.post(
  '/',
  authMiddleware,
  roleMiddleware(Role.STUDENT),
  SubmissionController.store,
);
