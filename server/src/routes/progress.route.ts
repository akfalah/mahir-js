import { Router } from 'express';

import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

import { ProgressController } from '../controllers/progress.controller';
import { Role } from '../../generated/prisma/enums';

export const progressRouter = Router();

progressRouter.get(
  '/',
  authMiddleware,
  roleMiddleware(Role.STUDENT),
  ProgressController.overviewProgress,
);
progressRouter.get(
  '/modules',
  authMiddleware,
  roleMiddleware(Role.STUDENT),
  ProgressController.moduleProgress,
);
progressRouter.get(
  '/materials',
  authMiddleware,
  roleMiddleware(Role.STUDENT),
  ProgressController.materialProgress,
);
progressRouter.get(
  '/exercises',
  authMiddleware,
  roleMiddleware(Role.STUDENT),
  ProgressController.exerciseProgress,
);
