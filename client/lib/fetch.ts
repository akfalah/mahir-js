import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/get-api-error-message';

import {
  ApiResponse,
  Concept,
  ConceptProgress,
  FetchParams,
  Material,
  MaterialProgress,
  StudyCase,
  StudyCaseProgress,
  Submission,
  SubmissionDetail,
  TestCase,
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

function emptyResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
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
    return emptyResponse<T[]>([]);
  }

  return fetchAPI<T[]>(path, token, params);
}

// ===== Concepts =====

export const fetchConcepts = (token?: AuthToken, params?: FetchParams) =>
  fetchAPI<Concept[]>('/concepts', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

export const fetchPublishedConcepts = (
  token?: AuthToken,
  params?: FetchParams,
) =>
  fetchConcepts(token, {
    isPublished: true,
    ...params,
  });

export const fetchConceptBySlug = (slug: string, token?: AuthToken) =>
  fetchAPI<Concept>(`/concepts/${slug}`, token);

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

export const fetchMaterialBySlug = (slug: string, token?: AuthToken) =>
  fetchAPI<Material>(`/materials/${slug}`, token);

// ===== Study Cases =====

export const fetchStudyCases = (token?: AuthToken, params?: FetchParams) =>
  fetchAPI<StudyCase[]>('/study-cases', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

export const fetchPublishedStudyCases = (
  token?: AuthToken,
  params?: FetchParams,
) =>
  fetchStudyCases(token, {
    isPublished: true,
    ...params,
  });

export const fetchStudyCaseBySlug = (slug: string, token?: AuthToken) =>
  fetchAPI<StudyCase>(`/study-cases/${slug}`, token);

// ===== Test Cases =====

export const fetchTestCases = (token?: AuthToken, params?: FetchParams) =>
  fetchAPI<TestCase[]>('/test-cases', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

// ===== Progress =====
// Protected data.
// Guest users get empty data instead of 401.

export const fetchConceptProgresses = (
  token?: AuthToken,
  params?: FetchParams,
) =>
  fetchProtectedList<ConceptProgress>('/progress/concepts', token, {
    ...params,
  });

export const fetchMaterialProgresses = (
  token?: AuthToken,
  params?: FetchParams,
) =>
  fetchProtectedList<MaterialProgress>('/progress/materials', token, {
    ...params,
  });

export const fetchStudyCaseProgresses = (
  token?: AuthToken,
  params?: FetchParams,
) =>
  fetchProtectedList<StudyCaseProgress>('/progress/study-cases', token, {
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
