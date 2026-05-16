import { Router } from 'express';

import { roleMiddleware } from '../middlewares/auth.middleware';

import { MaterialController } from '../controllers/material.controller';

export const materialRouter = Router();

materialRouter.get('/', MaterialController.index);
materialRouter.get('/:id', MaterialController.show);
materialRouter.post('/', roleMiddleware, MaterialController.store);
materialRouter.patch('/:id', roleMiddleware, MaterialController.update);
materialRouter.delete('/:id', roleMiddleware, MaterialController.destroy);
