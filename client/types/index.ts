// ===== Auth =====
export type Role = 'ADMIN' | 'STUDENT';

export type SignUpPayload = {
  email: string;
  name: string;
  password: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  imageUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

// ===== API Response =====
export type FetchParams = Record<string, string | number | boolean | undefined>;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  data: T;
  pagination?: PaginationMeta;
};

// ===== Concept =====
export type Concept = {
  id: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

// ===== Material =====
export type Material = {
  id: number;
  conceptId: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

// ===== Study Case =====
export type SyntaxRules = {
  required?: string[];
  forbidden?: string[];
};

export type StudyCase = {
  id: number;
  materialId: number;
  slug: string;
  title: string;
  description: string;
  hint: string | null;
  order: number;
  starterCode: string;
  syntaxRules: SyntaxRules;
  parameterNames: string[] | null;
  functionName: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

// ===== Test Case =====
export type TestCase = {
  id: number;
  studyCaseId: number;
  description: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

// ===== Submission =====
export type SubmissionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'PASSED'
  | 'FAILED'
  | 'ERROR';

export type Submission = {
  id: number;
  userId: number;
  studyCaseId: number;
  code: string;
  status: SubmissionStatus;
  errorMessage: string | null;
  createdAt: string;
};

// ===== Test Result =====
export type TestResultStatus = 'PASSED' | 'FAILED' | 'ERROR';

export type TestResult = {
  id: number;
  submissionId: number;
  testCaseId: number;
  description: string;
  status: TestResultStatus;
  expected: string;
  received: string;
  failureMessage: string | null;
};

export type SubmissionDetail = Submission & {
  testResults: TestResult[];
};

// ===== Progress =====
export type ConceptProgress = {
  id: number;
  userId: number;
  conceptId: number;
  isCompleted: boolean;
  completedAt: string | null;
  updatedAt: string;
};

export type MaterialProgress = {
  id: number;
  userId: number;
  materialId: number;
  isCompleted: boolean;
  completedAt: string | null;
  updatedAt: string;
};

export type StudyCaseProgress = {
  id: number;
  userId: number;
  studyCaseId: number;
  isCompleted: boolean;
  completedAt: string | null;
  updatedAt: string;
};
