import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import {
  authMiddleware,
  optionalAuthMiddleware,
  roleMiddleware,
} from '../middlewares/auth.middleware';

import { ConceptController } from '../controllers/concept.controller';

export const conceptRouter = Router();

conceptRouter.get('/', optionalAuthMiddleware, ConceptController.index);
conceptRouter.get('/:id', optionalAuthMiddleware, ConceptController.show);
conceptRouter.post(
  '/',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  ConceptController.store,
);
conceptRouter.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  ConceptController.update,
);
conceptRouter.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  ConceptController.destroy,
);
