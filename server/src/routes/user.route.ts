import { Router } from 'express';

import { Role } from '../../generated/prisma/enums';

import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

import { UserController } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.get(
  '/',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  UserController.index,
);
userRouter.get(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  UserController.show,
);
userRouter.post(
  '/',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  UserController.store,
);
userRouter.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  UserController.update,
);
userRouter.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  UserController.destroy,
);
