import { Router } from 'express';

import { roleMiddleware } from '../middlewares/auth.middleware';

import { ConceptController } from '../controllers/concept.controller';

export const conceptRouter = Router();

conceptRouter.get('/', ConceptController.index);
conceptRouter.get('/:id', ConceptController.show);
conceptRouter.post('/', roleMiddleware, ConceptController.store);
conceptRouter.patch('/:id', roleMiddleware, ConceptController.update);
conceptRouter.delete('/:id', roleMiddleware, ConceptController.destroy);
