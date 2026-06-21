const API_URL = process.env.API_URL || 'http://localhost:3000';

type FetchParams = Record<string, string | number | boolean | undefined>;

async function fetchAPI<T>(
  path: string,
  token?: string,
  params?: FetchParams,
): Promise<{ data: T; pagination?: import('@/types').PaginationMeta }> {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = new URL(`${API_URL}/api${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(url.toString(), {
    cache: 'no-store',
    headers,
  });

  const json = await res.json();
  return { data: json.data, pagination: json.pagination };
}

export const fetchConcepts = (token?: string, params?: FetchParams) =>
  fetchAPI<import('@/types').Concept[]>('/concepts', token, {
    sortBy: 'createdAt',
    orderBy: 'asc',
    limit: 10,
    ...params,
  });

export const fetchConceptById = (id: string, token?: string) =>
  fetchAPI<import('@/types').Concept>(`/concepts/${id}`, token);

export const fetchMaterials = (token?: string, params?: FetchParams) =>
  fetchAPI<import('@/types').Material[]>('/materials', token, {
    limit: 10,
    ...params,
  });

export const fetchMaterialById = (id: string, token?: string) =>
  fetchAPI<import('@/types').Material>(`/materials/${id}`, token);

export const fetchStudyCases = (token?: string, params?: FetchParams) =>
  fetchAPI<import('@/types').StudyCase[]>('/study-cases', token, {
    limit: 10,
    ...params,
  });

export const fetchStudyCaseById = (id: string, token?: string) =>
  fetchAPI<import('@/types').StudyCase>(`/study-cases/${id}`, token);

export const fetchTestCases = (token?: string, params?: FetchParams) =>
  fetchAPI<import('@/types').TestCase[]>('/test-cases', token, {
    limit: 10,
    ...params,
  });

export const fetchTestCaseById = (id: string, token?: string) =>
  fetchAPI<import('@/types').TestCase>(`/test-cases/${id}`, token);

export const fetchSubmissions = (token: string, params?: FetchParams) =>
  fetchAPI<import('@/types').Submission[]>('/submissions', token, {
    sortBy: 'createdAt',
    orderBy: 'desc',
    limit: 10,
    ...params,
  });

export const fetchSubmissionById = (id: string, token: string) =>
  fetchAPI<import('@/types').SubmissionDetail>(`/submissions/${id}`, token);

export const fetchConceptProgresses = (token: string) =>
  fetchAPI<import('@/types').ConceptProgress[]>('/progress/concepts', token);

export const fetchMaterialProgresses = (token: string) =>
  fetchAPI<import('@/types').MaterialProgress[]>('/progress/materials', token);

export const fetchStudyCaseProgresses = (token: string) =>
  fetchAPI<import('@/types').StudyCaseProgress[]>(
    '/progress/study-cases',
    token,
  );
