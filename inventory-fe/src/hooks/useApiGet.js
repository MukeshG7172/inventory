import { useCallback, useEffect, useState } from 'react';
import { client } from '../api/client';
import { useRefresh } from '../context/appContexts';

/**
 * GET a path, with loading and error state. Refetches on reload() and after
 * useRefresh().refresh(), keeping the previous data on screen meanwhile.
 */
export function useApiGet(path) {
  const { version } = useRefresh();
  const [attempt, setAttempt] = useState(0);
  const key = `${path}#${version}.${attempt}`;
  const [result, setResult] = useState({ path: null, key: null, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    client.get(path, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ path, key, data, error: null });
      },
      (error) => {
        if (controller.signal.aborted) return;
        setResult((previous) => ({
          path,
          key,
          data: previous.path === path ? previous.data : null,
          error,
        }));
      },
    );

    return () => controller.abort();
  }, [path, key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const current = result.path === path;

  return {
    data: current ? result.data : null,
    error: current ? result.error : null,
    loading: result.key !== key,
    reload,
  };
}
