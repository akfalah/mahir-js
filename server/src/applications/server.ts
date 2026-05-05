import express from 'express';

import { errorMiddleware } from '../middlewares/error.middleware';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { userRouter } from '../routes/user.route';
import { authRouter } from '../routes/auth.route';

export const server = express();

server.use(express.json());

server.use('/api/auth', authRouter);
server.use('/api/users', authMiddleware, roleMiddleware, userRouter);

server.use(errorMiddleware);
