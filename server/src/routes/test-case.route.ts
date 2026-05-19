import { Router } from 'express';

import { roleMiddleware } from '../middlewares/auth.middleware';

import { TestCaseController } from '../controllers/test-case.controller';

export const testCaseRouter = Router();

testCaseRouter.get('/', TestCaseController.index);
testCaseRouter.get('/:id', TestCaseController.show);
testCaseRouter.post('/', roleMiddleware, TestCaseController.store);
testCaseRouter.patch('/:id', roleMiddleware, TestCaseController.update);
testCaseRouter.delete('/:id', roleMiddleware, TestCaseController.destroy);
