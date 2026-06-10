import express from 'express';

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
server.use('/api/users', userRouter);
server.use('/api/concepts', conceptRouter);
server.use('/api/materials', materialRouter);
server.use('/api/study-cases', studyCaseRouter);
server.use('/api/test-cases', testCaseRouter);
server.use('/api/submissions', submissionRouter);
server.use('/api/progress', progressRouter);

server.use(errorMiddleware);
