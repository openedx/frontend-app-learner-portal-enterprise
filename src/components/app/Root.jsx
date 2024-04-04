import {
  Outlet, ScrollRestoration, useParams, Link,
} from 'react-router-dom';
import { Suspense, useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { Hyperlink } from '@openedx/paragon';

import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';
import { Toasts, ToastsProvider } from '../Toasts';
import { ErrorPage } from '../error-page';
import { useNProgressLoader } from './data';

const Root = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { enterpriseSlug } = useParams();

  const isAppDataHydrated = useNProgressLoader();

  // In the special case where there is not authenticated user and we are being told it's the logout
  // flow, we can show the logout message safely.
  // not rendering the SiteFooter here since it looks like it requires additional setup
  // not available in the logged out state (errors with InjectIntl errors)
  if (!authenticatedUser) {
    return (
      <ErrorPage title="You are now logged out." showSiteFooter={false}>
        Please log back in {' '}
        {enterpriseSlug ? (
          <Link to={`${getConfig().BASE_URL}/${enterpriseSlug}`}>
            here
          </Link>
        ) : (
          <Hyperlink destination={getLoginRedirectUrl(global.location.href)}>
            here.
          </Hyperlink>
        )}
      </ErrorPage>
    );
  }

  if (!isAppDataHydrated) {
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
