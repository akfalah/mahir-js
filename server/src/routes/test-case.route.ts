import { Router } from 'express';

import { roleMiddleware } from '../middlewares/auth.middleware';

import { TestCaseController } from '../controllers/test-case.controller';

export const testCaseRouter = Router();

testCaseRouter.get('/', TestCaseController.index);
testCaseRouter.get('/:id', TestCaseController.show);
testCaseRouter.post('/', TestCaseController.store);
testCaseRouter.patch('/:id', TestCaseController.update);
testCaseRouter.delete('/:id', TestCaseController.destroy);
