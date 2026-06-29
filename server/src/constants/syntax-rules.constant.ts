export const AST_NODE = {
  IF_STATEMENT: 'IfStatement',
  SWITCH_STATEMENT: 'SwitchStatement',

  FOR_STATEMENT: 'ForStatement',
  WHILE_STATEMENT: 'WhileStatement',
  DO_WHILE_STATEMENT: 'DoWhileStatement',
  FOR_IN_STATEMENT: 'ForInStatement',
  FOR_OF_STATEMENT: 'ForOfStatement',

  FUNCTION_DECLARATION: 'FunctionDeclaration',
  FUNCTION_EXPRESSION: 'FunctionExpression',
  ARROW_FUNCTION_EXPRESSION: 'ArrowFunctionExpression',

  TRY_STATEMENT: 'TryStatement',
} as const;

export type AstNodeName = (typeof AST_NODE)[keyof typeof AST_NODE];

export type SyntaxRules = {
  required?: AstNodeName[];
  forbidden?: AstNodeName[];
};

const BODY_ONLY_FORBIDDEN_NODES: AstNodeName[] = [
  AST_NODE.FUNCTION_DECLARATION,
  AST_NODE.ARROW_FUNCTION_EXPRESSION,
  AST_NODE.FUNCTION_EXPRESSION,
  AST_NODE.TRY_STATEMENT,
];

const FOR_LOOP_ALTERNATIVE_FORBIDDEN_NODES: AstNodeName[] = [
  AST_NODE.WHILE_STATEMENT,
  AST_NODE.DO_WHILE_STATEMENT,
  AST_NODE.FOR_IN_STATEMENT,
  AST_NODE.FOR_OF_STATEMENT,
];

const WHILE_LOOP_ALTERNATIVE_FORBIDDEN_NODES: AstNodeName[] = [
  AST_NODE.FOR_STATEMENT,
  AST_NODE.DO_WHILE_STATEMENT,
  AST_NODE.FOR_IN_STATEMENT,
  AST_NODE.FOR_OF_STATEMENT,
];

const FUNCTION_DECLARATION_FORBIDDEN_NODES: AstNodeName[] = [
  AST_NODE.ARROW_FUNCTION_EXPRESSION,
  AST_NODE.FUNCTION_EXPRESSION,
  AST_NODE.TRY_STATEMENT,
];

const ARROW_FUNCTION_FORBIDDEN_NODES: AstNodeName[] = [
  AST_NODE.FUNCTION_DECLARATION,
  AST_NODE.FUNCTION_EXPRESSION,
  AST_NODE.TRY_STATEMENT,
];

export const SYNTAX_RULE_PRESETS = {
  NO_RESTRICTION: {
    required: [],
    forbidden: [],
  },

  BODY_ONLY: {
    required: [],
    forbidden: BODY_ONLY_FORBIDDEN_NODES,
  },

  CONDITIONAL_BODY_ONLY: {
    required: [AST_NODE.IF_STATEMENT],
    forbidden: [AST_NODE.SWITCH_STATEMENT, ...BODY_ONLY_FORBIDDEN_NODES],
  },

  SWITCH_BODY_ONLY: {
    required: [AST_NODE.SWITCH_STATEMENT],
    forbidden: [AST_NODE.IF_STATEMENT, ...BODY_ONLY_FORBIDDEN_NODES],
  },

  FOR_LOOP_BODY_ONLY: {
    required: [AST_NODE.FOR_STATEMENT],
    forbidden: [
      ...FOR_LOOP_ALTERNATIVE_FORBIDDEN_NODES,
      ...BODY_ONLY_FORBIDDEN_NODES,
    ],
  },

  WHILE_LOOP_BODY_ONLY: {
    required: [AST_NODE.WHILE_STATEMENT],
    forbidden: [
      ...WHILE_LOOP_ALTERNATIVE_FORBIDDEN_NODES,
      ...BODY_ONLY_FORBIDDEN_NODES,
    ],
  },

  FUNCTION_DECLARATION: {
    required: [AST_NODE.FUNCTION_DECLARATION],
    forbidden: FUNCTION_DECLARATION_FORBIDDEN_NODES,
  },

  ARROW_FUNCTION: {
    required: [AST_NODE.ARROW_FUNCTION_EXPRESSION],
    forbidden: ARROW_FUNCTION_FORBIDDEN_NODES,
  },
} satisfies Record<string, SyntaxRules>;

export const ALLOWED_SYNTAX_RULE_NODES = Object.values(AST_NODE);

export function cloneSyntaxRules(rules: SyntaxRules): SyntaxRules {
  return {
    required: [...(rules.required ?? [])],
    forbidden: [...(rules.forbidden ?? [])],
  };
}
