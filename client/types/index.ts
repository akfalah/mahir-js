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
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

// ===== API Response =====
export type FetchParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  message: string;
  data: T;
  pagination?: PaginationMeta;
};

// ===== Shared Relation Types =====
// A flat parent reference — what /modules/:slug, /materials/:slug and
// /exercises/:slug embed on their child rows. No nesting: a Material's
// `module` ref doesn't itself carry a `materials` list, etc.
export type EntityRef = {
  id: number;
  slug: string;
  title: string;
  order: number;
};

// ===== Module =====
export type Module = {
  id: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // Present on GET /modules/:slug (ModuleDetailResponse). Absent on the
  // /modules list endpoint.
  materials?: MaterialSummary[];
};

export type ModuleDetail = Module & { materials: MaterialSummary[] };

// ===== Material =====
export type MaterialSummary = {
  id: number;
  moduleId: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished?: boolean; // only present for admin requests
};

export type Material = {
  id: number;
  moduleId: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // Present on GET /materials/:slug always, and on the /materials list
  // endpoint for admin requests only.
  module?: EntityRef;
  // Present on GET /materials/:slug (MaterialDetailResponse).
  exercises?: ExerciseSummary[];
};

export type MaterialDetail = Material & {
  module: EntityRef;
  exercises: ExerciseSummary[];
};

// ===== Exercise =====
export type SyntaxRules = {
  required?: string[];
  forbidden?: string[];
};

export type ExerciseSummary = {
  id: number;
  materialId: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished?: boolean;
};

export type Exercise = {
  id: number;
  materialId: number;
  slug: string;
  title: string;
  description: string;
  hint: string | null;
  order: number;
  starterCode: string | null;
  syntaxRules: SyntaxRules;
  parameterNames: string[] | null;
  functionName: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  material?: EntityRef;
  // Present on GET /exercises/:slug (ExerciseDetailResponse).
  testCases?: TestCaseSummary[];
};

export type ExerciseDetailFull = Exercise & {
  material: EntityRef;
  testCases: TestCaseSummary[];
};

// ===== Test Case =====
export type TestCaseSummary = {
  id: number;
  exerciseId: number;
  description: string;
  order: number;
  isPublished?: boolean;
};

export type TestCase = {
  id: number;
  exerciseId: number;
  description: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  exercise?: EntityRef;
};

// ===== Submission =====
export type SubmissionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'PASSED'
  | 'FAILED'
  | 'ERROR';

export type SubmissionUser = {
  id: number;
  name: string;
  email: string;
};

export type Submission = {
  id: number;
  userId: number;
  exerciseId: number;
  code: string;
  status: SubmissionStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  exercise?: EntityRef;
  user?: SubmissionUser;
};

// ===== Test Result =====
export type TestResultStatus = 'PASSED' | 'FAILED' | 'ERROR';

export type DisplayedTestStatus = TestResultStatus | 'PENDING';

export type TestResult = {
  id: number;
  submissionId: number;
  testCaseId: number;
  description: string;
  status: TestResultStatus;
  expected: string | null;
  received: string | null;
  failureMessage: string | null;
};

export type SubmissionDetail = Submission & {
  testResults: TestResult[];
};

// ===== Progress =====
type Count = { completed: number; total: number };

export type OverviewProgress = {
  modules: Count;
  materials: Count;
  exercises: Count;
  percentage: number;
};

export type ModuleProgress = {
  id: number;
  userId: number;
  moduleId: number;
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

export type ExerciseProgress = {
  id: number;
  userId: number;
  exerciseId: number;
  isCompleted: boolean;
  completedAt: string | null;
  updatedAt: string;
};

// ===== Learning Streak =====
export type LearningStreak = {
  currentStreak: number;
  today: string; // YYYY-MM-DD, from the BE
  activeDates: string[]; // YYYY-MM-DD
};

// ===== Card Status =====
export type CardStatus = 'completed' | 'in-progress' | 'locked'
