import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import {
  authMiddleware,
  optionalAuthMiddleware,
  roleMiddleware,
} from '../middlewares/auth.middleware';

import { ModuleController } from '../controllers/module.controller';

export const moduleRouter = Router();

moduleRouter.get('/', optionalAuthMiddleware, ModuleController.index);
moduleRouter.get('/:slug', optionalAuthMiddleware, ModuleController.show);
moduleRouter.post(
  '/',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  ModuleController.store,
);
moduleRouter.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  ModuleController.update,
);
moduleRouter.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  ModuleController.destroy,
);
