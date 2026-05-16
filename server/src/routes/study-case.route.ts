import { Router } from 'express';

import { roleMiddleware } from '../middlewares/auth.middleware';

import { StudyCaseController } from '../controllers/study-case.controller';

export const studyCaseRouter = Router();

studyCaseRouter.get('/', StudyCaseController.index);
studyCaseRouter.get('/:id', StudyCaseController.show);
studyCaseRouter.post('/', roleMiddleware, StudyCaseController.store);
studyCaseRouter.patch('/:id', roleMiddleware, StudyCaseController.update);
studyCaseRouter.delete('/:id', roleMiddleware, StudyCaseController.destroy);
