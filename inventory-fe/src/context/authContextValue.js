import { createContext } from 'react';

/* Kept apart from AuthProvider so React Fast Refresh keeps working. */
export const AuthContext = createContext(null);
