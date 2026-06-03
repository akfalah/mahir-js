import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import { roleMiddleware } from '../middlewares/auth.middleware';

import { ConceptController } from '../controllers/concept.controller';

export const conceptRouter = Router();

conceptRouter.get('/', ConceptController.index);
conceptRouter.get('/:id', ConceptController.show);
conceptRouter.post('/', roleMiddleware(Role.ADMIN), ConceptController.store);
conceptRouter.patch(
  '/:id',
  roleMiddleware(Role.ADMIN),
  ConceptController.update,
);
conceptRouter.delete(
  '/:id',
  roleMiddleware(Role.ADMIN),
  ConceptController.destroy,
);
