import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/get-api-error-message';

import {
  ApiResponse,
  Module,
  ModuleDetail,
  ModuleProgress,
  FetchParams,
  Material,
  MaterialDetail,
  MaterialProgress,
  Exercise,
  ExerciseDetailFull,
  ExerciseProgress,
  Submission,
  SubmissionDetail,
  TestCase,
  LearningStreak,
  OverviewProgress,
} from '@/types';

type AuthToken = string | null | undefined;

function cleanParams(params?: FetchParams) {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== null && value !== undefined && value !== '';
    }),
  );
}

function getRequestConfig(token?: AuthToken, params?: FetchParams) {
  return {
    params: cleanParams(params),
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  };
}

function emptyListResponse<T>(): ApiResponse<T[]> {
  return {
    message: 'No token provided',
    data: [],
  };
}

async function fetchAPI<T>(
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

async function fetchProtectedList<T>(
  path: string,
  token?: AuthToken,
  params?: FetchParams,
): Promise<ApiResponse<T[]>> {
  if (!token) {
    return emptyListResponse<T>();
  }

  return fetchAPI<T[]>(path, token, params);
}

// For single-object protected endpoints (not lists): the guest fallback is a
// caller-supplied zeroed-out object, not an empty array, since ApiResponse<T[]>
// and ApiResponse<T> are different shapes and can't share one fallback.
async function fetchProtectedObject<T>(
  path: string,
  fallback: T,
  token?: AuthToken,
  params?: FetchParams,
): Promise<ApiResponse<T>> {
  if (!token) {
    return { message: 'No token provided', data: fallback };
  }

  return fetchAPI<T>(path, token, params);
}

// ===== Modules =====

export const fetchModules = (token?: AuthToken, params?: FetchParams) =>
  fetchAPI<Module[]>('/modules', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

export const fetchPublishedModules = (
  token?: AuthToken,
  params?: FetchParams,
) =>
  fetchModules(token, {
    isPublished: true,
    ...params,
  });

// Always includes `materials` (ModuleDetailResponse on the BE) — use this
// return type instead of plain `Module` so callers don't need to guard
// against `materials` being undefined for this specific endpoint.
export const fetchModuleBySlug = (slug: string, token?: AuthToken) =>
  fetchAPI<ModuleDetail>(`/modules/${slug}`, token);

// ===== Materials =====

export const fetchMaterials = (token?: AuthToken, params?: FetchParams) =>
  fetchAPI<Material[]>('/materials', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

export const fetchPublishedMaterials = (
  token?: AuthToken,
  params?: FetchParams,
) =>
  fetchMaterials(token, {
    isPublished: true,
    ...params,
  });

// Always includes `module` and `exercises` (MaterialDetailResponse on the BE).
export const fetchMaterialBySlug = (slug: string, token?: AuthToken) =>
  fetchAPI<MaterialDetail>(`/materials/${slug}`, token);

// ===== Exercises =====

export const fetchExercises = (token?: AuthToken, params?: FetchParams) =>
  fetchAPI<Exercise[]>('/exercises', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

export const fetchPublishedExercises = (
  token?: AuthToken,
  params?: FetchParams,
) =>
  fetchExercises(token, {
    isPublished: true,
    ...params,
  });

// Always includes `material` and `testCases` (ExerciseDetailResponse on the BE).
export const fetchExerciseBySlug = (slug: string, token?: AuthToken) =>
  fetchAPI<ExerciseDetailFull>(`/exercises/${slug}`, token);

// ===== Test Cases =====

export const fetchTestCases = (token?: AuthToken, params?: FetchParams) =>
  fetchAPI<TestCase[]>('/test-cases', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

// ===== Progress =====
// Protected. Student only — GET /progress and its sub-routes take no query
// params on the BE today; params is kept only for forward-compatibility.
// Guest users get a zeroed-out overview / empty lists instead of a 401.

export const fetchOverviewProgress = (token?: AuthToken) =>
  fetchProtectedObject<OverviewProgress>(
    '/progress',
    {
      modules: { completed: 0, total: 0 },
      materials: { completed: 0, total: 0 },
      exercises: { completed: 0, total: 0 },
      percentage: 0,
    },
    token,
  );

export const fetchModuleProgress = (token?: AuthToken, params?: FetchParams) =>
  fetchProtectedList<ModuleProgress>('/progress/modules', token, {
    ...params,
  });

export const fetchMaterialProgress = (
  token?: AuthToken,
  params?: FetchParams,
) =>
  fetchProtectedList<MaterialProgress>('/progress/materials', token, {
    ...params,
  });

export const fetchExerciseProgress = (
  token?: AuthToken,
  params?: FetchParams,
) =>
  fetchProtectedList<ExerciseProgress>('/progress/exercises', token, {
    ...params,
  });

// ===== Submissions =====
// Protected data.
// Guest users get empty data instead of 401.

export const fetchSubmissions = (token?: AuthToken, params?: FetchParams) =>
  fetchProtectedList<Submission>('/submissions', token, {
    sortBy: 'createdAt',
    orderBy: 'desc',
    limit: 10,
    ...params,
  });

export const fetchSubmissionById = (id: string | number, token: string) =>
  fetchAPI<SubmissionDetail>(`/submissions/${id}`, token);

// ===== Learning Streak =====
// Protected. Student only — GET /learning-streak takes no query params.
// Guest users get a zeroed-out streak instead of a 401.

export const fetchLearningStreak = (token?: AuthToken) =>
  fetchProtectedObject<LearningStreak>(
    '/learning-streak',
    { currentStreak: 0, today: '', activeDates: [] },
    token,
  );
