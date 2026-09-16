import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import {
  authMiddleware,
  optionalAuthMiddleware,
  roleMiddleware,
} from '../middlewares/auth.middleware';

import { ExerciseController } from '../controllers/exercise.controller';

export const exerciseRouter = Router();

exerciseRouter.get('/', optionalAuthMiddleware, ExerciseController.index);
exerciseRouter.get('/:slug', optionalAuthMiddleware, ExerciseController.show);
exerciseRouter.post(
  '/',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  ExerciseController.store,
);
exerciseRouter.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  ExerciseController.update,
);
exerciseRouter.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  ExerciseController.destroy,
);
