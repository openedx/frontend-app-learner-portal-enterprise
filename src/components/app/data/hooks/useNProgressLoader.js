import { useContext, useEffect } from 'react';
import { useFetchers, useNavigation } from 'react-router-dom';
import nprogress from 'accessible-nprogress';
import { AppContext } from '@edx/frontend-platform/react';

import useNotices from './useNotices';

// Determines amount of time that must elapse before the
// NProgress loader is shown in the UI. No need to show it
// for quick route transitions.
export const NPROGRESS_DELAY_MS = 300;

function useNProgressLoader(queryOptions = {}) {
  const { authenticatedUser } = useContext(AppContext);
  const isAuthenticatedUserHydrated = !!authenticatedUser?.extendedProfile;
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const {
    data: noticeRedirectUrl,
    isLoading: isLoadingNotices,
  } = useNotices(queryOptions.useNotices);

  const hasNoticeRedirectUrl = !isLoadingNotices && !!noticeRedirectUrl;
  const isAppDataHydrated = isAuthenticatedUserHydrated && !hasNoticeRedirectUrl;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchersIdle = fetchers.every((f) => f.state === 'idle');
      if (navigation.state === 'idle' && fetchersIdle && isAppDataHydrated) {
        nprogress.done();
      } else {
        nprogress.start();
      }
    }, NPROGRESS_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [navigation, fetchers, isAppDataHydrated]);

  return isAppDataHydrated;
}

export default useNProgressLoader;
