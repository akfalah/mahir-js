import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import {
  authMiddleware,
  optionalAuthMiddleware,
  roleMiddleware,
} from '../middlewares/auth.middleware';

import { StudyCaseController } from '../controllers/study-case.controller';

export const studyCaseRouter = Router();

studyCaseRouter.get('/', optionalAuthMiddleware, StudyCaseController.index);
studyCaseRouter.get('/:slug', optionalAuthMiddleware, StudyCaseController.show);
studyCaseRouter.post(
  '/',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  StudyCaseController.store,
);
studyCaseRouter.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  StudyCaseController.update,
);
studyCaseRouter.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  StudyCaseController.destroy,
);
