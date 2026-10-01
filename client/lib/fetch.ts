import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/get-api-error-message';

import {
  ApiResponse,
  Exercise,
  ExerciseDetailFull,
  ExerciseProgress,
  FetchParams,
  LearningStreak,
  Material,
  MaterialDetail,
  MaterialProgress,
  Module,
  ModuleDetail,
  ModuleProgress,
  OverviewProgress,
  Submission,
  SubmissionDetail,
  TestCase,
} from '@/types';

type AuthToken = string | null | undefined;

function cleanParams(params?: FetchParams) {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    ),
  );
}

function getRequestConfig(token?: AuthToken, params?: FetchParams) {
  return {
    params: cleanParams(params),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  };
}

export async function fetchAPI<T>(
  path: string,
  token?: AuthToken,
  params?: FetchParams,
): Promise<ApiResponse<T>> {
  try {
    const res = await api.get<ApiResponse<T>>(
      path,
      getRequestConfig(token, params),
    );

    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

// ---- Factory for "list" endpoints (/modules, /materials, /exercises, ...) ----

type ListFetcherConfig = {
  path: string;
  defaultSortBy?: string;
  defaultOrderBy?: 'asc' | 'desc';
  defaultLimit?: number;
};

function createListFetcher<T>({
  path,
  defaultSortBy = 'createdAt',
  defaultOrderBy = 'asc',
  defaultLimit = 100,
}: ListFetcherConfig) {
  return (token?: AuthToken, params?: FetchParams) =>
    fetchAPI<T[]>(path, token, {
      sortBy: defaultSortBy,
      orderBy: defaultOrderBy,
      limit: defaultLimit,
      ...params,
    });
}

// ---- Factory for "detail by slug" endpoints (/modules/:slug, ...) ----

function createDetailFetcher<T>(pathPrefix: string) {
  return (slug: string, token?: AuthToken) =>
    fetchAPI<T>(`${pathPrefix}/${slug}`, token);
}

// ---- Factory for guest-safe protected LIST endpoints ----

function createProtectedListFetcher<T>(path: string) {
  return (
    token?: AuthToken,
    params?: FetchParams,
  ): Promise<ApiResponse<T[]>> => {
    if (!token) {
      return Promise.resolve({ message: 'No token provided', data: [] });
    }
    return fetchAPI<T[]>(path, token, params);
  };
}

// ---- Factory for guest-safe protected OBJECT endpoints ----

function createProtectedObjectFetcher<T>(path: string, fallback: T) {
  return (token?: AuthToken): Promise<ApiResponse<T>> => {
    if (!token) {
      return Promise.resolve({ message: 'No token provided', data: fallback });
    }
    return fetchAPI<T>(path, token);
  };
}

// ===== Modules =====
export const fetchModules = createListFetcher<Module>({ path: '/modules' });
export const fetchModuleBySlug = createDetailFetcher<ModuleDetail>('/modules');
export const fetchPublishedModules = (
  token?: AuthToken,
  params?: FetchParams,
) => fetchModules(token, { isPublished: true, ...params });

// ===== Materials =====
export const fetchMaterials = createListFetcher<Material>({
  path: '/materials',
});
export const fetchMaterialBySlug =
  createDetailFetcher<MaterialDetail>('/materials');
export const fetchPublishedMaterials = (
  token?: AuthToken,
  params?: FetchParams,
) => fetchMaterials(token, { isPublished: true, ...params });

// ===== Exercises =====
export const fetchExercises = createListFetcher<Exercise>({
  path: '/exercises',
});
export const fetchExerciseBySlug =
  createDetailFetcher<ExerciseDetailFull>('/exercises');
export const fetchPublishedExercises = (
  token?: AuthToken,
  params?: FetchParams,
) => fetchExercises(token, { isPublished: true, ...params });

// ===== Test Cases =====
export const fetchTestCases = createListFetcher<TestCase>({
  path: '/test-cases',
});

// ===== Progress =====
// Protected. Student only. Guests get zeroed/empty data instead of 401.
export const fetchOverviewProgress =
  createProtectedObjectFetcher<OverviewProgress>('/progress', {
    modules: { completed: 0, total: 0 },
    materials: { completed: 0, total: 0 },
    exercises: { completed: 0, total: 0 },
    percentage: 0,
  });
export const fetchModuleProgress =
  createProtectedListFetcher<ModuleProgress>('/progress/modules');
export const fetchMaterialProgress =
  createProtectedListFetcher<MaterialProgress>('/progress/materials');
export const fetchExerciseProgress =
  createProtectedListFetcher<ExerciseProgress>('/progress/exercises');

// ===== Submissions =====
// Protected data. Guest users get empty data instead of 401.
export const fetchSubmissions = createListFetcher<Submission>({
  path: '/submissions',
  defaultSortBy: 'createdAt',
  defaultOrderBy: 'desc',
  defaultLimit: 10,
});
// Overriding the base: submissions need the empty-fallback-for-guests behavior too
export const fetchSubmissionsForGuests =
  createProtectedListFetcher<Submission>('/submissions');

export const fetchSubmissionById = (id: string | number, token: string) =>
  fetchAPI<SubmissionDetail>(`/submissions/${id}`, token);

// ===== Learning Streak =====
export const fetchLearningStreak = createProtectedObjectFetcher<LearningStreak>(
  '/learning-streak',
  { currentStreak: 0, today: '', activeDates: [] },
);
