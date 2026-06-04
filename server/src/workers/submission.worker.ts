import { fork } from 'child_process';
import path from 'path';

import {
  SubmissionStatus,
  TestResultStatus,
} from '../../generated/prisma/enums';

import { prisma } from '../applications/database';
import { logger } from '../applications/logger';

import { TestCaseInput } from '../models/test-case.model';
import { ExecutionResult } from '../models/test-result.model';

import { ProgressService } from '../services/progress.service';

const EXECUTION_TIMEOUT_MS = 15000;

function runInSandbox(
  code: string,
  functionName: string,
  parameterNames: string[],
  testCases: TestCaseInput[],
): Promise<ExecutionResult[]> {
  return new Promise((resolve, reject) => {
    const child = fork(
      path.join(__dirname, '../executors/code.executor.js'),
      [],
      {
        env: {
          PATH: process.env.PATH,
        },
        silent: true,
        execArgv: ['--max-old-space-size=64'],
      },
    );

    child.stdout?.on('data', (data) => {
      logger.info('[EXECUTOR STDOUT]', {
        output: data.toString(),
      });
    });

    child.stderr?.on('data', (data) => {
      logger.error('[EXECUTOR STDERR]', {
        output: data.toString(),
      });
    });

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('Execution timed out'));
    }, EXECUTION_TIMEOUT_MS);

    child.send({ code, functionName, parameterNames, testCases });

    child.on(
      'message',
      (response: {
        success: boolean;
        results?: ExecutionResult[];
        error?: string;
      }) => {
        clearTimeout(timeout);

        if (response.success && response.results) {
          resolve(response.results);
        } else {
          reject(new Error(response.error ?? 'Execution failed'));
        }
      },
    );

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    child.on('exit', (code) => {
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });
  });
}

export async function executeSubmission(submissionId: number): Promise<void> {
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: SubmissionStatus.RUNNING },
  });

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      studyCase: {
        include: {
          testCases: { orderBy: { order: 'asc' } },},
      },
    },
  });

  if (!submission) return;

  const { code, studyCase } = submission;
  const { testCases, functionName, parameterNames } = studyCase;

  try {
    const testCaseInputs: TestCaseInput[] = testCases.map((tc) => ({
      id: tc.id,
      description: tc.description,
      input: tc.input as Record<string, unknown>,
      expected: tc.expected as Record<string, unknown>,
    }));

    const results = await runInSandbox(
      code,
      functionName ?? '',
      (parameterNames as string[]) ?? [],
      testCaseInputs,
    );

    await prisma.testResult.createMany({
      data: results.map((r) => ({
        submissionId,
        testCaseId: r.testCaseId,
        description: r.description,
        status: r.status,
        expected: r.expected,
        received: r.received,
        failureMessage: r.failureMessage,
      })),
    });

    const allPassed = results.every(
      (r) => r.status === TestResultStatus.PASSED,
    );

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: allPassed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED,
      },
    });

    if (allPassed) {
      await ProgressService.updateOnSubmissionPassed(
        submission.userId,
        submission.studyCaseId,
      );
    }
  } catch (e) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.ERROR,
        errorMessage: e instanceof Error ? e.message : 'Unknown error',
      },
    });
  }
}
