import axios, { AxiosRequestConfig } from 'axios';

export const API_BASE = '/api';

const adminApi = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const ADMIN_TOKEN_KEY = 'ume_admin_token';
const ADMIN_USER_KEY = 'ume_admin_user';

export type AdminSessionUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export function getAdminToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function getAdminUser(): AdminSessionUser | null {
  if (typeof window === 'undefined') return null;

  const parse = (raw: string | null) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminSessionUser;
    } catch {
      return null;
    }
  };

  const adminUser = parse(localStorage.getItem(ADMIN_USER_KEY));
  if (adminUser?.role === 'admin') return adminUser;

  // One-time compatibility with older builds that stored the admin in ume_user.
  const legacyUser = parse(localStorage.getItem('ume_user'));
  if (getAdminToken() && legacyUser?.role === 'admin') {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(legacyUser));
    return legacyUser;
  }

  return null;
}

export function setAdminSession(token: string, user: AdminSessionUser) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  // Admin logout must never mutate customer-session storage. Older builds may
  // have left a legacy admin-shaped `ume_user`; without `ume_token` it is inert,
  // and the protected account layout refreshes customer data from `/auth/me`.
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (
    typeof FormData !== 'undefined' &&
    config.data instanceof FormData
  ) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Content-Type');
    } else if (config.headers) {
      delete (config.headers as any)['Content-Type'];
    }
  }

  return config;
});

function getAdminErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as
      | {
          message?: string;
          errors?: Array<{
            field?: string;
            message?: string;
          }>;
        }
      | undefined;

    const firstError = body?.errors?.[0]?.message;

    return (
      body?.message ||
      firstError ||
      `Request failed (${error.response?.status || 'network error'})`
    );
  }

  return error instanceof Error
    ? error.message
    : 'Request failed';
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const config: AxiosRequestConfig = {
    url: path.startsWith('/') ? path : `/${path}`,
    method: options.method || 'GET',
    headers: options.headers as
      | Record<string, string>
      | undefined,
  };

  if (options.body !== undefined) {
    if (
      typeof FormData !== 'undefined' &&
      options.body instanceof FormData
    ) {
      config.data = options.body;

      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    } else {
      try {
        config.data =
          typeof options.body === 'string'
            ? JSON.parse(options.body)
            : options.body;
      } catch {
        config.data = options.body;
      }
    }
  }

  try {
    const response = await adminApi.request<T>(config);

    const body: any = response.data;

    if (body?.success === false) {
      throw new Error(
        body.message || 'Request failed'
      );
    }

    return body;
  } catch (error) {
    throw new Error(
      getAdminErrorMessage(error)
    );
  }
}

export async function downloadAdminCsv(
  path: string,
  filename: string
) {
  const response = await adminApi.get(path, {
    responseType: 'json',
  });

  const rows = Array.isArray(response.data?.data)
    ? response.data.data
    : [];

  if (!rows.length) {
    throw new Error('No data to export');
  }

  const keys: string[] = Array.from(
    new Set(
      rows.flatMap(
        (row: Record<string, unknown>) =>
          Object.keys(row)
      )
    )
  );

  const flatten = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const escape = (value: unknown): string => {
    return `"${flatten(value).replace(/"/g, '""')}"`;
  };

  const csv = [
    keys.map(escape).join(','),

    ...rows.map(
      (row: Record<string, unknown>) =>
        keys
          .map((key: string) =>
            escape(row[key])
          )
          .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob(
    [`\uFEFF${csv}`],
    {
      type: 'text/csv;charset=utf-8;',
    }
  );

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;

  anchor.click();

  URL.revokeObjectURL(url);
}