import axios, { AxiosRequestConfig } from 'axios';

import { resolveBackendUrl } from './backend-url';

export type ApiResult<T> = {
  success?: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  message?: string;
  errors?: Array<{
    field?: string;
    message?: string;
  }>;
};

/** Axios config that also accepts a fetch-style `body` (JSON string or object). */
export type ApiRequestConfig = AxiosRequestConfig & {
  body?: unknown;
};

// Browsers go through the same-origin /api rewrite in next.config.ts; server
// components cannot use relative URLs, so they call the backend directly.
const apiBaseUrl =
  typeof window === 'undefined'
    ? `${resolveBackendUrl()}/api`
    : '/api';

export const publicApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

publicApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ume_token');

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | ApiResult<unknown>
      | undefined;

    const firstError = data?.errors?.[0]?.message;

    return (
      data?.message ||
      firstError ||
      `Request failed (${
        error.response?.status || 'network error'
      })`
    );
  }

  return error instanceof Error
    ? error.message
    : 'Request failed';
}

export async function apiFetch<T = unknown>(
  path: string,
  config: ApiRequestConfig = {},
): Promise<ApiResult<T>> {
  try {
    const { body, ...requestConfig } = config;

    if (body !== undefined && requestConfig.data === undefined) {
      try {
        requestConfig.data =
          typeof body === 'string'
            ? JSON.parse(body)
            : body;
      } catch {
        requestConfig.data = body;
      }
    }

    const response = await publicApi.request<ApiResult<T>>({
      url: path.startsWith('/') ? path : `/${path}`,
      ...requestConfig,
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function apiList<T>(
  path: string,
): Promise<T[]> {
  const result = await apiFetch<T[]>(path);

  return Array.isArray(result.data)
    ? result.data
    : [];
}

export async function apiOne<T>(
  path: string,
): Promise<T | undefined> {
  const result = await apiFetch<T>(path);

  return result.data;
}

export function apiErrorMessage(error: unknown) {
  return getErrorMessage(error);
}