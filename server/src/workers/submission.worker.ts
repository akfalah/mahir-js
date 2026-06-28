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

export function runSubmissionCode(
  code: string,
  functionName: string,
  parameterNames: string[],
  testCases: TestCaseInput[],
  syntaxRules: Record<string, string[]> | null,
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

    child.send({
      code,
      functionName,
      parameterNames,
      testCases,
      syntaxRules,
    });

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
          testCases: {
            where: {
              isPublished: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
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

    const results = await runSubmissionCode(
      code,
      functionName ?? '',
      (parameterNames as string[]) ?? [],
      testCaseInputs,
      studyCase.syntaxRules as Record<string, string[]> | null,
    );

    await prisma.testResult.deleteMany({
      where: {
        submissionId,
      },
    });

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

    const hasError = results.some((r) => r.status === TestResultStatus.ERROR);

    const status = allPassed
      ? SubmissionStatus.PASSED
      : hasError
        ? SubmissionStatus.ERROR
        : SubmissionStatus.FAILED;

    if (allPassed) {
      await ProgressService.updateOnSubmissionPassed(
        submission.userId,
        submission.studyCaseId,
      );
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status,
        errorMessage: null,
      },
    });
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
