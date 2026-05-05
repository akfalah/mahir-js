import { Router } from 'express';

import { authMiddleware } from '../middlewares/auth.middleware';

import { AuthController } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.delete('/logout', authMiddleware, AuthController.logout);
authRouter.get('/profile', authMiddleware, AuthController.profile);
authRouter.patch('/profile', authMiddleware, AuthController.updateProfile);
