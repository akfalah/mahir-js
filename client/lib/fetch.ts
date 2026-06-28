import { ApiResponse, FetchParams } from '@/types';

const SERVER_API_URL =
  process.env.SERVER_API_URL || 'http://localhost:8888/api';

async function fetchAPI<T>(
  path: string,
  token?: string,
  params?: FetchParams,
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = new URL(`${SERVER_API_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), {
    cache: 'no-store',
    headers,
  });

  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error('API returned non-JSON response', {
      url: url.toString(),
      status: res.status,
      body: text.slice(0, 300),
    });

    throw new Error(`API returned non-JSON response: ${url.toString()}`);
  }

  if (!res.ok) {
    console.error('API error', {
      url: url.toString(),
      status: res.status,
      body: json,
    });

    throw new Error(json.errors || json.message || 'Failed to fetch API');
  }

  return {
    data: json.data,
    pagination: json.pagination,
  };
}

export const fetchConcepts = (token?: string, params?: FetchParams) =>
  fetchAPI<import('@/types').Concept[]>('/concepts', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

export const fetchConceptBySlug = (slug: string, token?: string) =>
  fetchAPI<import('@/types').Concept>(`/concepts/${slug}`, token);

export const fetchMaterials = (token?: string, params?: FetchParams) =>
  fetchAPI<import('@/types').Material[]>('/materials', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

export const fetchMaterialBySlug = (slug: string, token?: string) =>
  fetchAPI<import('@/types').Material>(`/materials/${slug}`, token);

export const fetchStudyCases = (token?: string, params?: FetchParams) =>
  fetchAPI<import('@/types').StudyCase[]>('/study-cases', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

export const fetchStudyCaseBySlug = (slug: string, token?: string) =>
  fetchAPI<import('@/types').StudyCase>(`/study-cases/${slug}`, token);

export const fetchTestCases = (token?: string, params?: FetchParams) =>
  fetchAPI<import('@/types').TestCase[]>('/test-cases', token, {
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
    ...params,
  });

export const fetchSubmissions = (token: string, params?: FetchParams) =>
  fetchAPI<import('@/types').Submission[]>('/submissions', token, {
    sortBy: 'createdAt',
    orderBy: 'desc',
    limit: 10,
    ...params,
  });

export const fetchSubmissionById = (id: string, token: string) =>
  fetchAPI<import('@/types').SubmissionDetail>(`/submissions/${id}`, token);
