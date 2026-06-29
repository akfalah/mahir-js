export const AST_NODE = {
  IF_STATEMENT: 'IfStatement',
  SWITCH_STATEMENT: 'SwitchStatement',
  CONDITIONAL_EXPRESSION: 'ConditionalExpression',

  FOR_STATEMENT: 'ForStatement',
  WHILE_STATEMENT: 'WhileStatement',
  DO_WHILE_STATEMENT: 'DoWhileStatement',
  FOR_IN_STATEMENT: 'ForInStatement',
  FOR_OF_STATEMENT: 'ForOfStatement',

  FUNCTION_DECLARATION: 'FunctionDeclaration',
  FUNCTION_EXPRESSION: 'FunctionExpression',
  ARROW_FUNCTION_EXPRESSION: 'ArrowFunctionExpression',
  RETURN_STATEMENT: 'ReturnStatement',

  IMPORT_DECLARATION: 'ImportDeclaration',
  IMPORT_EXPRESSION: 'ImportExpression',
  EXPORT_NAMED_DECLARATION: 'ExportNamedDeclaration',
  EXPORT_DEFAULT_DECLARATION: 'ExportDefaultDeclaration',
  EXPORT_ALL_DECLARATION: 'ExportAllDeclaration',

  TRY_STATEMENT: 'TryStatement',
} as const;

export type AstNodeName = (typeof AST_NODE)[keyof typeof AST_NODE];

export type SyntaxRules = {
  required?: AstNodeName[];
  forbidden?: AstNodeName[];
};

export const CONDITIONAL_AST_NODES: AstNodeName[] = [
  AST_NODE.IF_STATEMENT,
  AST_NODE.SWITCH_STATEMENT,
  AST_NODE.CONDITIONAL_EXPRESSION,
];

export const LOOPING_AST_NODES: AstNodeName[] = [
  AST_NODE.FOR_STATEMENT,
  AST_NODE.WHILE_STATEMENT,
  AST_NODE.DO_WHILE_STATEMENT,
  AST_NODE.FOR_IN_STATEMENT,
  AST_NODE.FOR_OF_STATEMENT,
];

export const FUNCTION_AST_NODES: AstNodeName[] = [
  AST_NODE.FUNCTION_DECLARATION,
  AST_NODE.FUNCTION_EXPRESSION,
  AST_NODE.ARROW_FUNCTION_EXPRESSION,
];

export const MODULE_FORBIDDEN_AST_NODES: AstNodeName[] = [
  AST_NODE.IMPORT_DECLARATION,
  AST_NODE.IMPORT_EXPRESSION,
  AST_NODE.EXPORT_NAMED_DECLARATION,
  AST_NODE.EXPORT_DEFAULT_DECLARATION,
  AST_NODE.EXPORT_ALL_DECLARATION,
];

export const OUT_OF_SCOPE_AST_NODES: AstNodeName[] = [AST_NODE.TRY_STATEMENT];

function uniqueNodes(nodes: AstNodeName[]) {
  return Array.from(new Set(nodes));
}

function createRules({
  required = [],
  forbidden = [],
}: {
  required?: AstNodeName[];
  forbidden?: AstNodeName[];
} = {}): SyntaxRules {
  return {
    required: uniqueNodes(required),
    forbidden: uniqueNodes([...MODULE_FORBIDDEN_AST_NODES, ...forbidden]),
  };
}

function excludeNodes(nodes: AstNodeName[], allowedNodes: AstNodeName[]) {
  return nodes.filter((node) => !allowedNodes.includes(node));
}

export function cloneSyntaxRules(rules: SyntaxRules): SyntaxRules {
  return {
    required: [...(rules.required ?? [])],
    forbidden: [...(rules.forbidden ?? [])],
  };
}

export const SYNTAX_RULE_PRESETS = {
  NO_RESTRICTION: createRules(),

  BODY_ONLY: createRules({
    forbidden: [...FUNCTION_AST_NODES, ...OUT_OF_SCOPE_AST_NODES],
  }),

  IF_BODY_ONLY: createRules({
    required: [AST_NODE.IF_STATEMENT],
    forbidden: [
      ...excludeNodes(CONDITIONAL_AST_NODES, [AST_NODE.IF_STATEMENT]),
      ...LOOPING_AST_NODES,
      ...FUNCTION_AST_NODES,
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  SWITCH_BODY_ONLY: createRules({
    required: [AST_NODE.SWITCH_STATEMENT],
    forbidden: [
      ...excludeNodes(CONDITIONAL_AST_NODES, [AST_NODE.SWITCH_STATEMENT]),
      ...LOOPING_AST_NODES,
      ...FUNCTION_AST_NODES,
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  TERNARY_BODY_ONLY: createRules({
    required: [AST_NODE.CONDITIONAL_EXPRESSION],
    forbidden: [
      ...excludeNodes(CONDITIONAL_AST_NODES, [AST_NODE.CONDITIONAL_EXPRESSION]),
      ...LOOPING_AST_NODES,
      ...FUNCTION_AST_NODES,
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  FOR_LOOP_BODY_ONLY: createRules({
    required: [AST_NODE.FOR_STATEMENT],
    forbidden: [
      ...excludeNodes(LOOPING_AST_NODES, [AST_NODE.FOR_STATEMENT]),
      ...FUNCTION_AST_NODES,
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  WHILE_LOOP_BODY_ONLY: createRules({
    required: [AST_NODE.WHILE_STATEMENT],
    forbidden: [
      ...excludeNodes(LOOPING_AST_NODES, [AST_NODE.WHILE_STATEMENT]),
      ...FUNCTION_AST_NODES,
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  DO_WHILE_LOOP_BODY_ONLY: createRules({
    required: [AST_NODE.DO_WHILE_STATEMENT],
    forbidden: [
      ...excludeNodes(LOOPING_AST_NODES, [AST_NODE.DO_WHILE_STATEMENT]),
      ...FUNCTION_AST_NODES,
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  FOR_OF_LOOP_BODY_ONLY: createRules({
    required: [AST_NODE.FOR_OF_STATEMENT],
    forbidden: [
      ...excludeNodes(LOOPING_AST_NODES, [AST_NODE.FOR_OF_STATEMENT]),
      ...FUNCTION_AST_NODES,
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  FOR_IN_LOOP_BODY_ONLY: createRules({
    required: [AST_NODE.FOR_IN_STATEMENT],
    forbidden: [
      ...excludeNodes(LOOPING_AST_NODES, [AST_NODE.FOR_IN_STATEMENT]),
      ...FUNCTION_AST_NODES,
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  FUNCTION_DECLARATION: createRules({
    required: [AST_NODE.FUNCTION_DECLARATION],
    forbidden: [
      ...excludeNodes(FUNCTION_AST_NODES, [AST_NODE.FUNCTION_DECLARATION]),
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  FUNCTION_EXPRESSION: createRules({
    required: [AST_NODE.FUNCTION_EXPRESSION],
    forbidden: [
      ...excludeNodes(FUNCTION_AST_NODES, [AST_NODE.FUNCTION_EXPRESSION]),
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  ARROW_FUNCTION: createRules({
    required: [AST_NODE.ARROW_FUNCTION_EXPRESSION],
    forbidden: [
      ...excludeNodes(FUNCTION_AST_NODES, [AST_NODE.ARROW_FUNCTION_EXPRESSION]),
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),

  // alias supaya seed lama yang pakai nama ini tidak langsung error
  CONDITIONAL_BODY_ONLY: createRules({
    required: [AST_NODE.IF_STATEMENT],
    forbidden: [
      ...excludeNodes(CONDITIONAL_AST_NODES, [AST_NODE.IF_STATEMENT]),
      ...LOOPING_AST_NODES,
      ...FUNCTION_AST_NODES,
      ...OUT_OF_SCOPE_AST_NODES,
    ],
  }),
} satisfies Record<string, SyntaxRules>;

export const ALLOWED_SYNTAX_RULE_NODES = Object.values(AST_NODE);
