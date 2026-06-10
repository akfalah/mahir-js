import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

import { TestCaseController } from '../controllers/test-case.controller';

export const testCaseRouter = Router();

testCaseRouter.get('/', TestCaseController.index);
testCaseRouter.get('/:id', TestCaseController.show);
testCaseRouter.post('/', authMiddleware, roleMiddleware(Role.ADMIN), TestCaseController.store);
testCaseRouter.patch('/:id', authMiddleware, roleMiddleware(Role.ADMIN), TestCaseController.update);
testCaseRouter.delete('/:id', authMiddleware, roleMiddleware(Role.ADMIN), TestCaseController.destroy);
