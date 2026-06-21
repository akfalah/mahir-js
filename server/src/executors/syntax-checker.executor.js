'use strict';

const acorn = require('acorn');

const AST_NODE_DESCRIPTIONS = {
  IfStatement: 'if/else statement',
  SwitchStatement: 'switch statement',
  ForStatement: 'for loop',
  WhileStatement: 'while loop',
  DoWhileStatement: 'do-while loop',
  ForInStatement: 'for-in loop',
  ForOfStatement: 'for-of loop',
  FunctionDeclaration: 'function declaration',
  ArrowFunctionExpression: 'arrow function',
  FunctionExpression: 'function expression',
  TryStatement: 'try-catch statement',
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
  if (!syntaxRules) return { passed: true, errors: [] };

  const { required = [], forbidden = [] } = syntaxRules;
  const errors = [];

  let ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 2020,
      sourceType: 'script',
    });
  } catch (parseErr) {
    return {
      passed: false,
      errors: [`Syntax error: ${parseErr.message}`],
    };
  }

  const nodeTypes = collectNodes(ast);

  // cek forbidden nodes
  for (const forbidden_node of forbidden) {
    if (nodeTypes.has(forbidden_node)) {
      const description =
        AST_NODE_DESCRIPTIONS[forbidden_node] ?? forbidden_node;
      errors.push(
        `You are not allowed to use ${description} in this study case`,
      );
    }
  }

  // cek required nodes
  for (const required_node of required) {
    if (!nodeTypes.has(required_node)) {
      const description = AST_NODE_DESCRIPTIONS[required_node] ?? required_node;
      errors.push(`You must use ${description} in this study case`);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}

module.exports = { checkSyntax };
