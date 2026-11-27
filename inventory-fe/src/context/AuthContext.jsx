import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  client,
  clearSession,
  readSession,
  saveSession,
  setUnauthorizedHandler,
  TOKEN_KEY,
  USER_KEY,
} from '../api/client';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }) {
  /* Read storage during the first render, so protected pages never flash. */
  const [session, setSession] = useState(readSession);

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null));

    /* Follow sign-in and sign-out made in other tabs. */
    const syncTabs = (event) => {
      if (event.key === null || event.key === TOKEN_KEY || event.key === USER_KEY) {
        setSession(readSession());
      }
    };
    window.addEventListener('storage', syncTabs);

    return () => {
      setUnauthorizedHandler(null);
      window.removeEventListener('storage', syncTabs);
    };
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const { token, id, email, role, ...rest } = await client.post('/auth/login', {
      username,
      password,
    });
    const next = { token, user: { id, username: rest.username, email, role } };
    saveSession(next);
    setSession(next);
    return next.user;
  }, []);

  /* The backend returns a message only; the user signs in afterwards. */
  const register = useCallback(
    (details) => client.post('/auth/register', details),
    [],
  );

  /* ProtectedRoute handles the redirect once the session is gone. */
  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      role: session?.user.role ?? null,
      isAuthenticated: session !== null,
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
