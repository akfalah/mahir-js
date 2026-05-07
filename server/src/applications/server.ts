import express from 'express';

import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { errorMiddleware } from '../middlewares/error.middleware';

import { authRouter } from '../routes/auth.route';
import { userRouter } from '../routes/user.route';
import { conceptRouter } from '../routes/concept.route';

export const server = express();

server.use(express.json());

server.use('/api/auth', authRouter);
server.use('/api/users', authMiddleware, roleMiddleware, userRouter);
server.use('/api/concepts', authMiddleware, conceptRouter);

server.use(errorMiddleware);
