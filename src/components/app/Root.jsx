import {
  Outlet, ScrollRestoration, useFetchers, useNavigation, useParams,
} from 'react-router-dom';
import {
  Suspense, useContext, useEffect,
} from 'react';
import NProgress from 'accessible-nprogress';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { Hyperlink } from '@openedx/paragon';

import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';
import { Toasts, ToastsProvider } from '../Toasts';
import { ErrorPage } from '../error-page';

// Determines amount of time that must elapse before the
// NProgress loader is shown in the UI. No need to show it
// for quick route transitions.
export const NPROGRESS_DELAY_MS = 300;

const Root = () => {
  const { authenticatedUser } = useContext(AppContext);
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const { enterpriseSlug } = useParams();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchersIdle = fetchers.every((f) => f.state === 'idle');
      const isAuthenticatedUserHydrated = !!authenticatedUser?.profileImage;
      if (navigation.state === 'idle' && fetchersIdle && !isAuthenticatedUserHydrated) {
        NProgress.done();
      } else {
        NProgress.start();
      }
    }, NPROGRESS_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [navigation, fetchers, authenticatedUser]);

  // in the special case where there is not authenticated user and we are being told it's the logout
  // flow, we can show the logout message safely.
  // not rendering the SiteFooter here since it looks like it requires additional setup
  // not available in the logged out state (errors with InjectIntl errors)
  if (!authenticatedUser) {
    let loginUrl = getLoginRedirectUrl(global.location.href);
    if (enterpriseSlug) {
      loginUrl = `${getConfig().BASE_URL}/${enterpriseSlug}`;
    }
    return (
      <ErrorPage title="You are now logged out." showSiteFooter={false}>
        Please log back in {' '}
        <Hyperlink destination={loginUrl}>
          here.
        </Hyperlink>
      </ErrorPage>
    );
  }

  if (!authenticatedUser.profileImage) {
    return null;
  }

  // User is authenticated, so render the child routes (rest of the app).
  return (
    <>
      <ToastsProvider>
        <Toasts />
        <Suspense fallback={<DelayedFallbackContainer />}>
          <Outlet />
        </Suspense>
      </ToastsProvider>
      <ScrollRestoration />
    </>
  );
};

export default Root;
