import { TestResultStatus } from '@/types';

function cleanFailureMessage(message?: string | null) {
  return (message ?? '')
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseOutputValue(value: unknown) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed === '') {
    return '';
  }

  if (trimmed === 'undefined') {
    return 'undefined';
  }

  if (trimmed === 'null') {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
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
