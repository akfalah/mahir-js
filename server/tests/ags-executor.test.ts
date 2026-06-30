import { TestResultStatus } from '../generated/prisma/enums';

import { runSubmissionCode } from '../src/workers/submission.worker';

const baseTestCases = [
  {
    id: 1,
    description: 'should return true for age 18',
    input: { age: 18 },
    expected: { result: true },
  },
  {
    id: 2,
    description: 'should return false for age 17',
    input: { age: 17 },
    expected: { result: false },
  },
];

describe('AGS executor and syntax checker', () => {
  it('runs body-only code by wrapping it with the target function', async () => {
    const results = await runSubmissionCode(
      'if (age >= 18) { return true; } return false;',
      'isAdult',
      ['age'],
      baseTestCases,
      { required: ['IfStatement'], forbidden: [] },
    );

    expect(results).toHaveLength(2);
    expect(results.every((result) => result.status === TestResultStatus.PASSED)).toBe(true);
    expect(results[0]).toMatchObject({ expected: 'true', received: 'true' });
  });

  it('runs full function declarations', async () => {
    const results = await runSubmissionCode(
      'function isAdult(age) { return age >= 18; }',
      'isAdult',
      ['age'],
      baseTestCases,
      { required: ['FunctionDeclaration'], forbidden: [] },
    );

    expect(results.every((result) => result.status === TestResultStatus.PASSED)).toBe(true);
  });

  it('runs arrow function submissions', async () => {
    const results = await runSubmissionCode(
      'const isAdult = (age) => age >= 18;',
      'isAdult',
      ['age'],
      baseTestCases,
      { required: ['ArrowFunctionExpression'], forbidden: ['FunctionDeclaration'] },
    );

    expect(results.every((result) => result.status === TestResultStatus.PASSED)).toBe(true);
  });

  it('returns FAILED results with expected and received values for wrong logic', async () => {
    const results = await runSubmissionCode(
      'if (age > 18) { return true; } return false;',
      'isAdult',
      ['age'],
      baseTestCases,
      { required: ['IfStatement'], forbidden: [] },
    );

    expect(results.some((result) => result.status === TestResultStatus.FAILED)).toBe(true);
    expect(results[0]).toMatchObject({
      status: TestResultStatus.FAILED,
      expected: 'true',
      received: 'false',
    });
    expect(results[0].failureMessage).not.toContain('node_modules');
  });

  it('returns ERROR when required syntax is missing', async () => {
    const results = await runSubmissionCode(
      'return age >= 18;',
      'isAdult',
      ['age'],
      baseTestCases,
      { required: ['IfStatement'], forbidden: [] },
    );

    expect(results.every((result) => result.status === TestResultStatus.ERROR)).toBe(true);
    expect(results[0].failureMessage).toContain('You must use');
  });

  it('returns ERROR when forbidden syntax is used', async () => {
    const results = await runSubmissionCode(
      'for (let i = 0; i < 1; i++) {} return age >= 18;',
      'isAdult',
      ['age'],
      baseTestCases,
      { required: [], forbidden: ['ForStatement'] },
    );

    expect(results.every((result) => result.status === TestResultStatus.ERROR)).toBe(true);
    expect(results[0].failureMessage).toContain('not allowed');
  });

  it('returns ERROR for JavaScript syntax errors', async () => {
    const results = await runSubmissionCode(
      'if (age >= 18) { return true;',
      'isAdult',
      ['age'],
      baseTestCases,
      { required: ['IfStatement'], forbidden: [] },
    );

    expect(results.every((result) => result.status === TestResultStatus.ERROR)).toBe(true);
    expect(results[0].failureMessage).toContain('Syntax error');
  });

  it('blocks dangerous modules through require', async () => {
    const results = await runSubmissionCode(
      "const fs = require('fs'); return age >= 18;",
      'isAdult',
      ['age'],
      baseTestCases,
      { required: [], forbidden: [] },
    );

    expect(results.every((result) => result.status === TestResultStatus.ERROR)).toBe(true);
    expect(results[0].failureMessage).toContain("Module 'fs' is not allowed");
  });

  it('blocks process global access', async () => {
    const results = await runSubmissionCode(
      'const env = process.env; return age >= 18;',
      'isAdult',
      ['age'],
      baseTestCases,
      { required: [], forbidden: [] },
    );

    expect(results.every((result) => result.status === TestResultStatus.ERROR)).toBe(true);
    expect(results[0].failureMessage).toContain('process');
  });
});
