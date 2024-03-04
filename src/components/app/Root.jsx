import {
  Outlet, ScrollRestoration, useParams,
} from 'react-router-dom';
import { Suspense, useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { Hyperlink } from '@openedx/paragon';

import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';
import { Toasts, ToastsProvider } from '../Toasts';
import NoticesProvider from '../notices-provider';
import { ErrorPage } from '../error-page';
import { useNProgressLoader } from './data';

const Root = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { enterpriseSlug } = useParams();

  useNProgressLoader();

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

  // User is authenticated with an active enterprise customer, but
  // the user account API data is still hydrating. If the user is
  // still hydrating, the NProgress loader will not complete.
  if (!authenticatedUser.profileImage) {
    return null;
  }

  // User is authenticated, so render the child routes (rest of the app).
  return (
    <NoticesProvider>
      <ToastsProvider>
        <Toasts />
        <Suspense fallback={<DelayedFallbackContainer />}>
          <Outlet />
        </Suspense>
      </ToastsProvider>
      <ScrollRestoration />
    </NoticesProvider>
  );
};

export default Root;
