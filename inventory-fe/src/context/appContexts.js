import { createContext, useContext } from 'react';

/* Bumping `version` makes every useApiGet refetch, e.g. after an order. */
export const RefreshContext = createContext({ version: 0, refresh: () => {} });
export const useRefresh = () => useContext(RefreshContext);

export const ToastContext = createContext(() => {});
/** Returns toast(message). */
export const useToast = () => useContext(ToastContext);
