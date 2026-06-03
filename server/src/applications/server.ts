import express from 'express';

import { Role } from '../../generated/prisma/enums';

import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { errorMiddleware } from '../middlewares/error.middleware';

import { authRouter } from '../routes/auth.route';
import { userRouter } from '../routes/user.route';
import { conceptRouter } from '../routes/concept.route';
import { materialRouter } from '../routes/material.route';
import { studyCaseRouter } from '../routes/study-case.route';
import { testCaseRouter } from '../routes/test-case.route';
import { submissionRouter } from '../routes/submission.route';
import { progressRouter } from '../routes/progress.route';

import '../queues/submission.queue';

export const server = express();

server.use(express.json());

server.use('/api/auth', authRouter);
server.use(
  '/api/users',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  userRouter,
);
server.use('/api/concepts', authMiddleware, conceptRouter);
server.use('/api/materials', authMiddleware, materialRouter);
server.use('/api/study-cases', authMiddleware, studyCaseRouter);
server.use(
  '/api/test-cases',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  testCaseRouter,
);
server.use('/api/submissions', authMiddleware, submissionRouter);
server.use('/api/progress', authMiddleware, progressRouter);

server.use(errorMiddleware);
