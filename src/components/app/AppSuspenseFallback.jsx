import { useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import nprogress from 'accessible-nprogress';

import { NPROGRESS_DELAY_MS } from './data/hooks/useNProgressLoader';

export function useNProgressLoaderWithoutRouter() {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      nprogress.start();
    }, NPROGRESS_DELAY_MS);
    return () => {
      clearTimeout(timeoutId);
      nprogress.done();
    };
  }, []);
}

const AppSuspenseFallback = () => {
  useNProgressLoaderWithoutRouter();

  useEffect(() => {
    const suspenseError = new Error(
      '[AppSuspenseFallback]: Unexpected suspense fallback triggered. Please verify that query data is pre-fetched via route loaders, where applicable.',
    );
    logError(suspenseError);
  }, []);

  return null;
};

export default AppSuspenseFallback;
