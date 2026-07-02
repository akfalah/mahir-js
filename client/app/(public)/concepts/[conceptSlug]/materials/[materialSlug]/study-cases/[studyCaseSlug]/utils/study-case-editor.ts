import { AlertCircle, CheckCircle2, Circle, XCircle } from 'lucide-react';

import { StudyCase, SubmissionDetail } from '@/types';

import api from '@/lib/api';
import { DisplayedTestStatus } from './types';

function stringifyValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function formatCaseValue(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length === 1) {
      return stringifyValue(entries[0][1]);
    }

    return entries
      .map(([key, item]) => `${key}: ${stringifyValue(item)}`)
      .join(', ');
  }

  return stringifyValue(value);
}

export function formatInputValue(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);

    return entries
      .map(([key, item]) => `${key}: ${stringifyValue(item)}`)
      .join(', ');
  }

  return stringifyValue(value);
}

export function getStudyCaseHint(studyCase: StudyCase) {
  if (studyCase.hint) {
    return studyCase.hint;
  }

  return 'Read the task carefully, start with a simple solution, run the test, then improve your code step by step.';
}

export function getTestCaseStatusStyle(
  status: DisplayedTestStatus = 'PENDING',
) {
  if (status === 'PASSED') {
    return {
      label: 'Passed',
      icon: CheckCircle2,
      className: 'border-green-200 bg-green-50 text-green-800',
    };
  }

  if (status === 'FAILED') {
    return {
      label: 'Needs Fix',
      icon: XCircle,
      className: 'border-red-200 bg-red-50 text-red-800',
    };
  }

  if (status === 'ERROR') {
    return {
      label: 'Error',
      icon: AlertCircle,
      className: 'border-orange-200 bg-orange-50 text-orange-800',
    };
  }

  return {
    label: 'Not Tested',
    icon: Circle,
    className: 'border-border bg-muted/30 text-muted-foreground',
  };
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getSubmissionResult(submissionId: number) {
  const maxAttempts = 15;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await api.get<{ data: SubmissionDetail }>(
      `/submissions/${submissionId}`,
    );

    const submission = res.data.data;

    if (submission.status !== 'PENDING' && submission.status !== 'RUNNING') {
      return submission;
    }

    await wait(1000);
  }

  throw new Error('Submission is still processing. Please try again.');
}
