import { useEffect } from 'react';
import nprogress from 'accessible-nprogress';

import { NPROGRESS_DELAY_MS } from '../data/hooks/useNProgressLoader';

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
  return null;
};

export default AppSuspenseFallback;
