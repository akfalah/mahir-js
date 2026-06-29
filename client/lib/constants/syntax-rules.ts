import { SyntaxRules } from '@/types';

export const AST_NODE = {
  // Conditional
  IF_STATEMENT: 'IfStatement',
  SWITCH_STATEMENT: 'SwitchStatement',
  CONDITIONAL_EXPRESSION: 'ConditionalExpression',

  // Looping
  FOR_STATEMENT: 'ForStatement',
  WHILE_STATEMENT: 'WhileStatement',
  DO_WHILE_STATEMENT: 'DoWhileStatement',
  FOR_IN_STATEMENT: 'ForInStatement',
  FOR_OF_STATEMENT: 'ForOfStatement',

  // Function
  FUNCTION_DECLARATION: 'FunctionDeclaration',
  FUNCTION_EXPRESSION: 'FunctionExpression',
  ARROW_FUNCTION_EXPRESSION: 'ArrowFunctionExpression',
  RETURN_STATEMENT: 'ReturnStatement',

  // Module / import-export
  IMPORT_DECLARATION: 'ImportDeclaration',
  IMPORT_EXPRESSION: 'ImportExpression',
  EXPORT_NAMED_DECLARATION: 'ExportNamedDeclaration',
  EXPORT_DEFAULT_DECLARATION: 'ExportDefaultDeclaration',
  EXPORT_ALL_DECLARATION: 'ExportAllDeclaration',

  // Other restricted syntax
  TRY_STATEMENT: 'TryStatement',
} as const;

export type AstNodeName = (typeof AST_NODE)[keyof typeof AST_NODE];

export type SyntaxRulePresetValue =
  | 'NO_RESTRICTION'
  | 'BODY_ONLY'
  | 'IF_BODY_ONLY'
  | 'SWITCH_BODY_ONLY'
  | 'TERNARY_BODY_ONLY'
  | 'FOR_LOOP_BODY_ONLY'
  | 'WHILE_LOOP_BODY_ONLY'
  | 'DO_WHILE_LOOP_BODY_ONLY'
  | 'FOR_OF_LOOP_BODY_ONLY'
  | 'FOR_IN_LOOP_BODY_ONLY'
  | 'FUNCTION_DECLARATION'
  | 'FUNCTION_EXPRESSION'
  | 'ARROW_FUNCTION';

export type SyntaxRulePreset = {
  label: string;
  value: SyntaxRulePresetValue;
  description: string;
  rules: SyntaxRules;
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

function normalizeRules(rules: SyntaxRules) {
  return JSON.stringify({
    required: [...(rules.required ?? [])].sort(),
    forbidden: [...(rules.forbidden ?? [])].sort(),
  });
}

export const SYNTAX_RULE_PRESETS: SyntaxRulePreset[] = [
  {
    label: 'No syntax restriction',
    value: 'NO_RESTRICTION',
    description:
      'Students can use any basic JavaScript syntax, but import/export syntax is still forbidden.',
    rules: createRules(),
  },
  {
    label: 'Body only',
    value: 'BODY_ONLY',
    description:
      'Students only write the function body. Function declarations and import/export syntax are forbidden.',
    rules: createRules({
      forbidden: [...FUNCTION_AST_NODES, ...OUT_OF_SCOPE_AST_NODES],
    }),
  },

  // Conditional
  {
    label: 'If statement body only',
    value: 'IF_BODY_ONLY',
    description: 'Students must use an if statement inside the function body.',
    rules: createRules({
      required: [AST_NODE.IF_STATEMENT],
      forbidden: [
        ...excludeNodes(CONDITIONAL_AST_NODES, [AST_NODE.IF_STATEMENT]),
        ...LOOPING_AST_NODES,
        ...FUNCTION_AST_NODES,
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },
  {
    label: 'Switch statement body only',
    value: 'SWITCH_BODY_ONLY',
    description:
      'Students must use a switch statement inside the function body.',
    rules: createRules({
      required: [AST_NODE.SWITCH_STATEMENT],
      forbidden: [
        ...excludeNodes(CONDITIONAL_AST_NODES, [AST_NODE.SWITCH_STATEMENT]),
        ...LOOPING_AST_NODES,
        ...FUNCTION_AST_NODES,
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },
  {
    label: 'Ternary expression body only',
    value: 'TERNARY_BODY_ONLY',
    description:
      'Students must use a ternary conditional expression inside the function body.',
    rules: createRules({
      required: [AST_NODE.CONDITIONAL_EXPRESSION],
      forbidden: [
        ...excludeNodes(CONDITIONAL_AST_NODES, [
          AST_NODE.CONDITIONAL_EXPRESSION,
        ]),
        ...LOOPING_AST_NODES,
        ...FUNCTION_AST_NODES,
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },

  // Looping
  {
    label: 'For loop body only',
    value: 'FOR_LOOP_BODY_ONLY',
    description:
      'Students must use a regular for loop inside the function body.',
    rules: createRules({
      required: [AST_NODE.FOR_STATEMENT],
      forbidden: [
        ...excludeNodes(LOOPING_AST_NODES, [AST_NODE.FOR_STATEMENT]),
        ...FUNCTION_AST_NODES,
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },
  {
    label: 'While loop body only',
    value: 'WHILE_LOOP_BODY_ONLY',
    description: 'Students must use a while loop inside the function body.',
    rules: createRules({
      required: [AST_NODE.WHILE_STATEMENT],
      forbidden: [
        ...excludeNodes(LOOPING_AST_NODES, [AST_NODE.WHILE_STATEMENT]),
        ...FUNCTION_AST_NODES,
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },
  {
    label: 'Do while loop body only',
    value: 'DO_WHILE_LOOP_BODY_ONLY',
    description: 'Students must use a do while loop inside the function body.',
    rules: createRules({
      required: [AST_NODE.DO_WHILE_STATEMENT],
      forbidden: [
        ...excludeNodes(LOOPING_AST_NODES, [AST_NODE.DO_WHILE_STATEMENT]),
        ...FUNCTION_AST_NODES,
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },
  {
    label: 'For of loop body only',
    value: 'FOR_OF_LOOP_BODY_ONLY',
    description: 'Students must use a for...of loop inside the function body.',
    rules: createRules({
      required: [AST_NODE.FOR_OF_STATEMENT],
      forbidden: [
        ...excludeNodes(LOOPING_AST_NODES, [AST_NODE.FOR_OF_STATEMENT]),
        ...FUNCTION_AST_NODES,
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },
  {
    label: 'For in loop body only',
    value: 'FOR_IN_LOOP_BODY_ONLY',
    description: 'Students must use a for...in loop inside the function body.',
    rules: createRules({
      required: [AST_NODE.FOR_IN_STATEMENT],
      forbidden: [
        ...excludeNodes(LOOPING_AST_NODES, [AST_NODE.FOR_IN_STATEMENT]),
        ...FUNCTION_AST_NODES,
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },

  // Function
  {
    label: 'Function declaration',
    value: 'FUNCTION_DECLARATION',
    description: 'Students must write a regular function declaration.',
    rules: createRules({
      required: [AST_NODE.FUNCTION_DECLARATION],
      forbidden: [
        ...excludeNodes(FUNCTION_AST_NODES, [AST_NODE.FUNCTION_DECLARATION]),
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },
  {
    label: 'Function expression',
    value: 'FUNCTION_EXPRESSION',
    description: 'Students must write a function expression.',
    rules: createRules({
      required: [AST_NODE.FUNCTION_EXPRESSION],
      forbidden: [
        ...excludeNodes(FUNCTION_AST_NODES, [AST_NODE.FUNCTION_EXPRESSION]),
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },
  {
    label: 'Arrow function',
    value: 'ARROW_FUNCTION',
    description: 'Students must write an arrow function.',
    rules: createRules({
      required: [AST_NODE.ARROW_FUNCTION_EXPRESSION],
      forbidden: [
        ...excludeNodes(FUNCTION_AST_NODES, [
          AST_NODE.ARROW_FUNCTION_EXPRESSION,
        ]),
        ...OUT_OF_SCOPE_AST_NODES,
      ],
    }),
  },
];

export const ALLOWED_SYNTAX_RULE_NODES = Object.values(AST_NODE);

export function getSyntaxRulePresetByRules(rules: SyntaxRules) {
  const currentRules = normalizeRules(rules);

  return (
    SYNTAX_RULE_PRESETS.find((preset) => {
      return normalizeRules(preset.rules) === currentRules;
    })?.value ?? 'NO_RESTRICTION'
  );
}
