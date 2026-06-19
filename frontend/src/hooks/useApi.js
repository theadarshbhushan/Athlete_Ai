import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const getErrorMessage = (error, fallback = 'Something went wrong.') =>
  error?.response?.data?.detail?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export function useApi(asyncFn, options = {}) {
  const {
    immediate = true,
    defaultData = null,
    showErrorToast = true,
    onSuccess,
  } = options;

  const [data, setData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await asyncFn(...args);
        const payload = response?.data?.data ?? response?.data ?? null;
        setData(payload);
        onSuccess?.(payload);
        return payload;
      } catch (requestError) {
        setError(requestError);

        if (showErrorToast) {
          toast.error(getErrorMessage(requestError));
        }

        throw requestError;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFn, onSuccess, showErrorToast],
  );

  useEffect(() => {
    if (!immediate) {
      setIsLoading(false);
      return;
    }

    execute().catch(() => {});
  }, [execute, immediate]);

  return {
    data,
    isLoading,
    error,
    execute,
    setData,
    getErrorMessage,
  };
}
