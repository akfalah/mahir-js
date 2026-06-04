'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

process.on('message', ({ code, functionName, parameterNames, testCases }) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mahirjs-'));
  const solutionFile = path.join(tempDir, 'solution.js');
  const testFile = path.join(tempDir, 'solution.test.js');
  const jestConfigFile = path.join(tempDir, 'jest.config.json');

  try {
    const hasDeclaration =
      code.includes(`function ${functionName}`) ||
      code.includes(`const ${functionName}`) ||
      code.includes(`let ${functionName}`) ||
      code.includes(`var ${functionName}`);

    const studentCode = hasDeclaration
      ? code
      : `function ${functionName}(${parameterNames.join(', ')}) {\n${code}\n}`;

    const wrappedCode = `
    ${studentCode}
    
    module.exports = { ${functionName} };
    `;

    fs.writeFileSync(solutionFile, wrappedCode, 'utf8');

    const testContent = generateJestTestFile(
      functionName,
      parameterNames,
      testCases,
    );
    fs.writeFileSync(testFile, testContent, 'utf8');

    fs.writeFileSync(
      jestConfigFile,
      JSON.stringify({
        testEnvironment: 'node',
        testMatch: ['**/*.test.js'],
        testTimeout: 3000,
        transform: {},
        collectCoverage: false,
      }),
      'utf8',
    );

    const jestBin = path.resolve(__dirname, '../../node_modules/.bin/jest');
    let output;

    try {
      output = execSync(
        `${jestBin} --config ${jestConfigFile} --json --no-coverage --forceExit`,
        {
          cwd: tempDir,
          timeout: 10000,
          env: { PATH: process.env.PATH },
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      ).toString();
    } catch (execErr) {
      output = execErr.stdout?.toString() ?? '';

      if (!output) {
        throw new Error(execErr.stderr?.toString() ?? 'Jest execution failed');
      }
    }

    const jestResult = JSON.parse(output);
    const results = parseJestResults(jestResult, testCases);

    process.send({ success: true, results });
  } catch (err) {
    process.send({
      success: false,
      error: err.message ?? 'Unknown error',
    });
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }

  process.exit(0);
});

function generateJestTestFile(functionName, parameterNames, testCases) {
  const testBlocks = testCases
    .map((tc) => {
      const args = parameterNames
        .map((param) => JSON.stringify(tc.input[param]))
        .join(', ');
      const expected = JSON.stringify(tc.expected.result);

      return `
        test(${JSON.stringify(tc.description)}, () => {
          const result = ${functionName}(${args});
          expect(result).toEqual(${expected});
        });
      `;
    })
    .join('\n');

  return `
    'use strict';

    const solution = require('./solution');
    const ${functionName} = solution.${functionName};

    describe(${JSON.stringify(functionName)}, () => {
    ${testBlocks}
    });
  `;
}

function parseJestResults(jestResult, testCases) {
  const results = [];

  const assertionMap = new Map();
  for (const suite of jestResult.testResults ?? []) {
    for (const assertion of suite.assertionResults ?? []) {
      assertionMap.set(assertion.title, assertion);
    }
  }

  for (const testCase of testCases) {
    const matched = assertionMap.get(testCase.description);

    if (!matched) {
      results.push({
        testCaseId: testCase.id,
        description: testCase.description,
        status: 'ERROR',
        expected: JSON.stringify(testCase.expected.result),
        received: null,
        failureMessage: `Test case "${testCase.description}" could not be matched`, // 👈
      });
      continue;
    }

    const passed = matched.status === 'passed';
    const failMessage = matched.failureMessages?.[0] ?? null;

    let received = null;
    if (passed) {
      received = JSON.stringify(testCase.expected.result);
    } else if (failMessage) {
      const receivedMatch = failMessage.match(/Received:\s*(.+)/);
      received = receivedMatch ? receivedMatch[1].trim() : null;
    }

    results.push({
      testCaseId: testCase.id,
      description: testCase.description,
      status: passed ? 'PASSED' : 'FAILED',
      expected: JSON.stringify(testCase.expected.result),
      received,
      failureMessage: passed ? null : failMessage,
    });
  }

  return results;
}
