import { Router } from 'express';

import { authMiddleware } from '../middlewares/auth.middleware';

import { ProgressController } from '../controllers/progress.controller';

export const progressRouter = Router();

progressRouter.get(
  '/concepts',
  authMiddleware,
  ProgressController.conceptProgresses,
);
progressRouter.get(
  '/materials',
  authMiddleware,
  ProgressController.materialProgresses,
);
progressRouter.get(
  '/study-cases',
  authMiddleware,
  ProgressController.studyCaseProgresses,
);
