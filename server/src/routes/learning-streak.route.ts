import { Router } from 'express';
import { Role } from '../../generated/prisma/enums';

import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

import { LearningStreakController } from '../controllers/learning-streak.controller';

export const learningStreakRouter = Router();

learningStreakRouter.get(
  '/',
  authMiddleware,
  roleMiddleware(Role.STUDENT),
  LearningStreakController.index,
);
