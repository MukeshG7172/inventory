/* Centralized fetch wrapper for the Spring Boot backend. */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(
  /\/+$/,
  '',
);

export const TOKEN_KEY = 'inventory_token';
export const USER_KEY = 'inventory_user';

/* ---------------------------------------------------------------- session storage */
export function readSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    return token && user ? { token, user } : null;
  } catch {
    return null;
  }
}

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/* AuthProvider registers here so a 401 can reset React state without a reload. */
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

/* ---------------------------------------------------------------- errors */
export class ApiError extends Error {
  /** status is 0 when the server could not be reached. */
  constructor(status, message, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/*
 * Backend error shapes:
 *   GlobalExceptionHandler  { timestamp, status, error, message }
 *   ...validation failures  { timestamp, status, error, errors: { field: message } }
 *   AuthController          { message: "Error: ..." }
 */
function toApiError(status, body) {
  const fieldErrors = body?.errors ?? {};
  let message = body?.message?.replace(/^Error:\s*/, '');

  if (Object.keys(fieldErrors).length > 0) {
    message ||= 'Please correct the highlighted fields.';
  }

  return new ApiError(
    status,
    message || body?.error || `Request failed with status ${status}.`,
    fieldErrors,
  );
}

function parseBody(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- request */
async function request(method, path, { body, headers, signal } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  /* A 401 from /auth/* means bad credentials, not an expired session. */
  const isAuthCall = path.startsWith('/auth/');

  let response;
  let text;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && !isAuthCall && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    text = await response.text();
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Cannot reach the server. Check that the backend is running.');
  }

  const data = parseBody(text);

  if (response.status === 401 && !isAuthCall) {
    /* Ignore late responses that belong to an earlier session. */
    if (token === localStorage.getItem(TOKEN_KEY)) {
      clearSession();
      onUnauthorized?.();
    }
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    throw toApiError(response.status, data);
  }

  return data;
}

export const client = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
};

export default client;
