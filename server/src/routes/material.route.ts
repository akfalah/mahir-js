import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

import { MaterialController } from '../controllers/material.controller';

export const materialRouter = Router();

materialRouter.get('/', MaterialController.index);
materialRouter.get('/:id', MaterialController.show);
materialRouter.post(
  '/',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  MaterialController.store,
);
materialRouter.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  MaterialController.update,
);
materialRouter.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  MaterialController.destroy,
);
