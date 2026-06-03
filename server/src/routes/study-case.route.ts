import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import { roleMiddleware } from '../middlewares/auth.middleware';

import { StudyCaseController } from '../controllers/study-case.controller';

export const studyCaseRouter = Router();

studyCaseRouter.get('/', StudyCaseController.index);
studyCaseRouter.get('/:id', StudyCaseController.show);
studyCaseRouter.post(
  '/',
  roleMiddleware(Role.ADMIN),
  StudyCaseController.store,
);
studyCaseRouter.patch(
  '/:id',
  roleMiddleware(Role.ADMIN),
  StudyCaseController.update,
);
studyCaseRouter.delete(
  '/:id',
  roleMiddleware(Role.ADMIN),
  StudyCaseController.destroy,
);
