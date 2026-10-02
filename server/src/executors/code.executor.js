'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { checkSyntax } = require(
  path.join(__dirname, './syntax-checker.executor'),
);

const BLOCKED_MODULES = [
  'fs',
  'path',
  'os',
  'child_process',
  'net',
  'http',
  'https',
  'crypto',
  'cluster',
  'worker_threads',
  'dgram',
  'dns',
  'tls',
  'readline',
  'stream',
  'zlib',
  'vm',
  'v8',
  'perf_hooks',
  'async_hooks',
  'inspector',
  'module',
  'buffer',
  'events',
  'util',
  'assert',
];

process.on(
  'message',
  ({ code, functionName, parameterNames, testCases, syntaxRules }) => {
    let tempDir;
    let finished = false;

    // single exit point: clean up first, then reply, then exit
    const finish = (payload) => {
      if (finished) return;
      finished = true;

      if (tempDir) {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }

      // exit only after the message has been flushed to the parent
      process.send(payload, () => process.exit(0));
    };

    try {
      const syntaxCheck = checkSyntax(code, syntaxRules);

      if (!syntaxCheck.passed) {
        return finish({
          success: true,
          results: buildErrorResults(testCases, syntaxCheck.errors.join('\n')),
        });
      }

      const runtimeAccessCheck = checkBlockedRuntimeAccess(syntaxCheck.ast);

      if (!runtimeAccessCheck.passed) {
        return finish({
          success: true,
          results: buildErrorResults(
            testCases,
            runtimeAccessCheck.errors.join('\n'),
          ),
        });
      }

      // detect whether the student wrote the full function or just the body
      const hasDeclaration = declaresFunction(syntaxCheck.ast, functionName);

      // the student wrote only function(s), but not the one this exercise asks for
      if (!hasDeclaration && definesOnlyFunctions(syntaxCheck.ast)) {
        return finish({
          success: true,
          results: buildErrorResults(
            testCases,
            `Your code must define a function named "${functionName}"`,
          ),
        });
      }

      const studentCode = hasDeclaration
        ? code
        : `function ${functionName}(${parameterNames.join(', ')}) {\n${code}\n}`;

      // block 'require' via proxy in solution.js
      const blockedModuleEntries = BLOCKED_MODULES.map(
        (mod) => `  '${mod}': true`,
      ).join(',\n');

      const wrappedCode = `
    'use strict';

    // block dangerous modules
    const _originalRequire = require;
    const _blockedModules = {
    ${blockedModuleEntries}
    };

    // override via global — do not redeclare 'require'
    global.require = function(mod) {
      if (_blockedModules[mod]) {
        throw new Error(\`Module '\${mod}' is not allowed\`);
      }
      
      if (typeof mod === 'string' && (mod.startsWith('.') || mod.startsWith('/'))) {
        throw new Error('Relative and absolute path imports are not allowed');
      }
      
      return _originalRequire(mod);
    };

    // block dangerous global access
    (function blockGlobals() {
      const blocked = ['process', '__dirname', '__filename'];
      for (const key of blocked) {
        try {
          Object.defineProperty(globalThis, key, {
            get() { throw new Error(\`'\${key}' is not allowed\`); },
            configurable: false,
          });
        } catch {}
      }
    })();

    // ============================================================
    // STUDENT CODE
    // ============================================================
    ${studentCode}
    // ============================================================

    module.exports = { ${functionName} };
    `;

      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mahirjs-'));
      const solutionFile = path.join(tempDir, 'solution.js');
      const testFile = path.join(tempDir, 'solution.test.js');
      const jestConfigFile = path.join(tempDir, 'jest.config.json');

      fs.writeFileSync(solutionFile, wrappedCode, 'utf8');

      // jest test file
      const testContent = generateJestTestFile(
        functionName,
        parameterNames,
        testCases,
      );
      fs.writeFileSync(testFile, testContent, 'utf8');

      // jest config — without moduleNameMapper
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

      // run jest
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
          return finish({
            success: false,
            error:
              execErr.stderr?.toString() ??
              'Jest execution failed with no output',
          });
        }
      }

      const jestResult = JSON.parse(output);
      const results = parseJestResults(jestResult, testCases);

      return finish({ success: true, results });
    } catch (err) {
      return finish({
        success: false,
        error: err.message ?? 'Unknown error',
      });
    }
  },
);

function buildErrorResults(testCases, failureMessage) {
  return testCases.map((testCase) => ({
    testCaseId: testCase.id,
    description: testCase.description,
    status: 'ERROR',
    expected: JSON.stringify(testCase.expected.result),
    received: null,
    failureMessage,
  }));
}

function isFunctionLike(node) {
  if (node.type === 'FunctionDeclaration') return true;

  return (
    node.type === 'VariableDeclaration' &&
    node.declarations.every(
      (declaration) =>
        declaration.init &&
        (declaration.init.type === 'FunctionExpression' ||
          declaration.init.type === 'ArrowFunctionExpression'),
    )
  );
}

function declaresFunction(ast, functionName) {
  return ast.body.some((node) => {
    if (node.type === 'FunctionDeclaration') {
      return node.id?.name === functionName;
    }

    if (node.type === 'VariableDeclaration') {
      return node.declarations.some(
        (declaration) =>
          declaration.id.type === 'Identifier' &&
          declaration.id.name === functionName,
      );
    }

    return false;
  });
}

function definesOnlyFunctions(ast) {
  return ast.body.length > 0 && ast.body.every(isFunctionLike);
}

function checkBlockedRuntimeAccess(ast) {
  if (!ast) {
    return { passed: false, errors: ['Could not analyze code'] };
  }

  const errors = [];
  const blockedGlobals = new Set(['process', '__dirname', '__filename']);
  const blockedCalls = new Set(['eval']);

  function traverse(node, parent) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'Identifier' && blockedGlobals.has(node.name)) {
      // `{ process: 1 }` or `{ process() {} }`: a property key, not the global.
      // Shorthand `{ process }` does reference the global, so it stays flagged.
      const isPropertyKey =
        parent &&
        parent.type === 'Property' &&
        parent.key === node &&
        !parent.computed &&
        !parent.shorthand;

      // `obj.process`: a property name, not the global
      const isMemberProperty =
        parent &&
        parent.type === 'MemberExpression' &&
        parent.property === node &&
        !parent.computed;

      if (!isPropertyKey && !isMemberProperty) {
        errors.push(`'${node.name}' is not allowed`);
      }
    }

    // eval(...), Function(...), new Function(...), require('fs')
    if (node.type === 'CallExpression' || node.type === 'NewExpression') {
      const callee = node.callee;

      if (callee && callee.type === 'Identifier') {
        if (blockedCalls.has(callee.name)) {
          errors.push(`'${callee.name}' is not allowed`);
        }

        if (callee.name === 'Function') {
          errors.push(`'Function' constructor is not allowed`);
        }

        if (callee.name === 'require') {
          const arg = node.arguments[0];

          if (arg && arg.type === 'Literal' && typeof arg.value === 'string') {
            const mod = arg.value;

            if (BLOCKED_MODULES.includes(mod)) {
              errors.push(`Module '${mod}' is not allowed`);
            } else if (mod.startsWith('.') || mod.startsWith('/')) {
              errors.push('Relative and absolute path imports are not allowed');
            }
          }
        }
      }
    }

    for (const key of Object.keys(node)) {
      if (
        key === 'type' ||
        key === 'loc' ||
        key === 'range' ||
        key === 'start' ||
        key === 'end'
      ) {
        continue;
      }

      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach((c) => traverse(c, node));
      } else if (child && typeof child === 'object') {
        traverse(child, node);
      }
    }
  }

  traverse(ast, null);

  // dedupe repeated errors (e.g. `process` referenced multiple times)
  const uniqueErrors = [...new Set(errors)];

  return {
    passed: uniqueErrors.length === 0,
    errors: uniqueErrors,
  };
}

function generateJestTestFile(functionName, parameterNames, testCases) {
  const testBlocks = testCases
    .map((testCase) => {
      const args = parameterNames
        .map((param) => JSON.stringify(testCase.input[param]))
        .join(', ');
      const expected = JSON.stringify(testCase.expected.result);

      return `
      test(${JSON.stringify(testCase.description)}, () => {
        const result = ${functionName}(${args});
        expect(result).toEqual(${expected});
      });`;
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

function cleanFailureMessage(failMessage) {
  if (!failMessage) return null;

  // extract only up to the first line that begins with 'at' (stack trace)
  const lines = failMessage.split('\n');
  const stackIndex = lines.findIndex((line) => line.trim().startsWith('at '));
  const relevantLines = stackIndex > 0 ? lines.slice(0, stackIndex) : lines;

  return relevantLines.join('\n').trim();
}

function parseJestResults(jestResult, testCases) {
  const results = [];

  // handle runtime error - the test suite fails to run at all
  const suiteError = jestResult.testResults?.[0];

  if (
    jestResult.numRuntimeErrorTestSuites > 0 &&
    suiteError?.assertionResults?.length === 0
  ) {
    const errorMessage = suiteError.message ?? 'Runtime error occurred';

    for (const testCase of testCases) {
      results.push({
        testCaseId: testCase.id,
        description: testCase.description,
        status: 'ERROR',
        expected: JSON.stringify(testCase.expected.result),
        received: null,
        failureMessage: cleanFailureMessage(errorMessage),
      });
    }

    return results;
  }

  // map assertion results by title
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
        failureMessage: `Test case "${testCase.description}" could not be matched`,
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
      failureMessage: passed ? null : cleanFailureMessage(failMessage),
    });
  }

  return results;
}
