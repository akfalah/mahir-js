import { Queue, Worker } from 'bullmq';

import { redisConnection } from '../applications/queue';

import { executeSubmission } from '../workers/submission.worker';

export const SUBMISSION_QUEUE_NAME = 'submission';

export const submissionQueue = new Queue(SUBMISSION_QUEUE_NAME, {
  connection: redisConnection,
});

export const submissionWorker = new Worker(
  SUBMISSION_QUEUE_NAME,
  async (job) => {
    await executeSubmission(job.data.submissionId);
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

submissionWorker.on('failed', (job, e) => {
  console.error(`Job ${job?.id} failed:`, e.message);
});
