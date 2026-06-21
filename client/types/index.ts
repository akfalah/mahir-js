// ===== Auth =====
export type Role = 'ADMIN' | 'STUDENT';

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  imageUrl?: string;
  bio?: string;
  createdAt: string;
};

// ===== Pagination =====
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

// ===== Concept =====
export type Concept = {
  id: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
};

// ===== Material =====
export type Material = {
  id: number;
  conceptId: number;
  slug: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
};

// ===== Study Case =====
export type StudyCase = {
  id: number;
  materialId: number;
  title: string;
  description: string;
  starterCode: string;
  order: number;
  parameterNames: string[];
  functionName: string;
  createdAt: string;
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
  isUnlocked: boolean;
  completedAt: string | null;
};

export type MaterialProgress = {
  id: number;
  userId: number;
  materialId: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  completedAt: string | null;
};

export type StudyCaseProgress = {
  id: number;
  userId: number;
  studyCaseId: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  completedAt: string | null;
};
