import { AlertCircle, CheckCircle2, Circle, XCircle } from 'lucide-react';

import { StudyCase, SubmissionDetail, TestResultStatus } from '@/types';

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

function cleanFailureMessage(message?: string | null) {
  return (message ?? '')
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseOutputValue(value?: unknown) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return trimmedValue;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    return trimmedValue;
  }
}

function getValueType(value: unknown) {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  return typeof value;
}

export function getWhatToCheck({
  status,
  expected,
  received,
  failureMessage,
}: {
  status?: TestResultStatus;
  expected?: unknown;
  received?: unknown;
  failureMessage?: string | null;
}) {
  if (!status || status === 'PASSED') {
    return null;
  }

  const cleanMessage = cleanFailureMessage(failureMessage);
  const parsedExpected = parseOutputValue(expected);
  const parsedReceived = parseOutputValue(received);
  const expectedType = getValueType(parsedExpected);

  if (status === 'ERROR') {
    if (cleanMessage.includes('SyntaxError')) {
      return 'Your code has a syntax error. Check missing brackets, parentheses, keywords, or symbols.';
    }

    if (cleanMessage.includes('ReferenceError')) {
      return 'Your code uses a variable or function that has not been defined. Check the spelling of your variable or function name.';
    }

    if (cleanMessage.includes('TypeError')) {
      return 'Your code uses a value in the wrong way. Check the data type, function call, or returned value.';
    }

    if (cleanMessage.toLowerCase().includes('timeout')) {
      return 'Your code took too long to run. Check whether your loop condition can stop correctly.';
    }

    return 'Your code could not run correctly. Check your syntax, function structure, and returned value.';
  }

  if (parsedReceived === undefined || parsedReceived === 'undefined') {
    return 'Your function did not return a value. Make sure you use return and return the expected result.';
  }

  if (parsedReceived === null || parsedReceived === 'null') {
    return 'Your function returned null. Check your condition or default return value.';
  }

  if (expectedType === 'boolean') {
    return 'Your boolean result is not correct. Check the condition and make sure it returns true or false in the right case.';
  }

  if (expectedType === 'number') {
    return 'Your number result is not correct. Check your calculation, operator, initial value, or loop process.';
  }

  if (expectedType === 'string') {
    return 'Your text result is not correct. Check spelling, capitalization, spacing, or the condition that returns the text.';
  }

  if (expectedType === 'array') {
    return 'Your array result is not correct. Check the item order, loop boundaries, and how you add values to the array.';
  }

  if (expectedType === 'object') {
    return 'Your object result is not correct. Check the property names, property values, and returned object structure.';
  }

  return 'Your result is different from the expected output. Review your logic and return value.';
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
