import { useContext, useEffect } from 'react';
import { useFetchers, useNavigation } from 'react-router-dom';
import nprogress from 'accessible-nprogress';
import { AppContext } from '@edx/frontend-platform/react';

// Determines amount of time that must elapse before the
// NProgress loader is shown in the UI. No need to show it
// for quick route transitions.
export const NPROGRESS_DELAY_MS = 300;

export interface UseNProgressLoaderOptions {
  shouldCompleteBeforeUnmount?: boolean;
}

function useNProgressLoader({ shouldCompleteBeforeUnmount = true }: UseNProgressLoaderOptions = {}) {
  const { authenticatedUser }: Types.AppContextValue = useContext(AppContext);
  const isAuthenticatedUserHydrated = !!authenticatedUser?.extendedProfile;
  const navigation = useNavigation();
  const fetchers = useFetchers();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchersIdle = fetchers.every((f) => f.state === 'idle');
      if (shouldCompleteBeforeUnmount && navigation.state === 'idle' && fetchersIdle && isAuthenticatedUserHydrated) {
        nprogress.done();
      } else {
        nprogress.start();
      }
    }, NPROGRESS_DELAY_MS);
    return () => {
      nprogress.done();
      clearTimeout(timeoutId);
    };
  }, [navigation, fetchers, isAuthenticatedUserHydrated, shouldCompleteBeforeUnmount]);

  return isAuthenticatedUserHydrated;
}

export default useNProgressLoader;
