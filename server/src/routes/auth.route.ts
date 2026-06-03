import { Router } from 'express';

import { authMiddleware } from '../middlewares/auth.middleware';

import { AuthController } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/sign-up', AuthController.signUp);
authRouter.post('/sign-in', AuthController.signIn);
authRouter.get('/profile', authMiddleware, AuthController.profile);
authRouter.patch('/profile', authMiddleware, AuthController.updateProfile);
authRouter.patch('/profile/password', authMiddleware, AuthController.updatePassword);
