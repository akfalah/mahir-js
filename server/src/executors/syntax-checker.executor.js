'use strict';

const acorn = require('acorn');

const AST_NODE_DESCRIPTIONS = {
  IfStatement: 'if/else statement',
  SwitchStatement: 'switch statement',
  ConditionalExpression: 'ternary expression',
  ForStatement: 'for loop',
  WhileStatement: 'while loop',
  DoWhileStatement: 'do-while loop',
  ForInStatement: 'for-in loop',
  ForOfStatement: 'for-of loop',
  FunctionDeclaration: 'function declaration',
  ArrowFunctionExpression: 'arrow function',
  FunctionExpression: 'function expression',
  ReturnStatement: 'return statement',
  TryStatement: 'try-catch statement',
  ImportDeclaration: 'import statement',
  ImportExpression: 'dynamic import',
  ExportNamedDeclaration: 'export statement',
  ExportDefaultDeclaration: 'default export',
  ExportAllDeclaration: 'export-all statement',
};

function collectNodes(ast) {
  const nodeTypes = new Set();

  function traverse(node) {
    if (!node || typeof node !== 'object') return;

    if (node.type) nodeTypes.add(node.type);

    for (const key of Object.keys(node)) {
      if (key === 'type') continue;

      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach(traverse);
      } else if (child && typeof child === 'object') {
        traverse(child);
      }
    }
  }

  traverse(ast);

  return nodeTypes;
}

function checkSyntax(code, syntaxRules) {
  // Always parse first: the AST is needed by the runtime-access check
  // even when the exercise has no syntaxRules.
  let ast;

  try {
    ast = acorn.parse(code, {
      ecmaVersion: 2020,
      sourceType: 'script',
      allowReturnOutsideFunction: true,
    });
  } catch (parseErr) {
    return {
      passed: false,
      errors: [`Syntax error: ${parseErr.message}`],
      ast: null,
    };
  }

  if (!syntaxRules) {
    return { passed: true, errors: [], ast };
  }

  const { required = [], forbidden = [] } = syntaxRules;
  const errors = [];
  const nodeTypes = collectNodes(ast);

  for (const forbiddenNode of forbidden) {
    if (nodeTypes.has(forbiddenNode)) {
      const description = AST_NODE_DESCRIPTIONS[forbiddenNode] ?? forbiddenNode;

      errors.push(`You are not allowed to use ${description} in this exercise`);
    }
  }

  for (const requiredNode of required) {
    if (!nodeTypes.has(requiredNode)) {
      const description = AST_NODE_DESCRIPTIONS[requiredNode] ?? requiredNode;
      
      errors.push(`You must use ${description} in this exercise`);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    ast,
  };
}

module.exports = { checkSyntax };
