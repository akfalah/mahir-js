import { StudyCase } from '@/types';

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
