import { Router } from 'express';

import { authMiddleware } from '../middlewares/auth.middleware';

import { ProgressController } from '../controllers/progress.controller';

export const progressRouter = Router();

progressRouter.get(
  '/modules',
  authMiddleware,
  ProgressController.moduleProgresses,
);
progressRouter.get(
  '/materials',
  authMiddleware,
  ProgressController.materialProgresses,
);
progressRouter.get(
  '/exercises',
  authMiddleware,
  ProgressController.exerciseProgresses,
);
