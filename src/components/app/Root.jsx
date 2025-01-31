import { useContext } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';
import { Hyperlink } from '@openedx/paragon';

import { Toasts, ToastsProvider } from '../Toasts';
import { ErrorPage } from '../error-page';
import { useNProgressLoader } from './data';

const UnauthenticatedRoot = () => (
  <ErrorPage title="You are now logged out." showSiteFooter={false}>
    Please log back in {' '}
    <Hyperlink destination={getLoginRedirectUrl(global.location.href)}>
      here.
    </Hyperlink>
  </ErrorPage>
);

const AuthenticatedRoot = () => (
  <>
    <ToastsProvider>
      <Toasts />
      <Outlet />
    </ToastsProvider>
    <ScrollRestoration />
  </>
);

const Root = () => {
  const { authenticatedUser } = useContext(AppContext);
  const isAppDataHydrated = useNProgressLoader();

  // In the special case where there is not authenticated user and we are being told it's the logout
  // flow, we can show the logout message safely.
  // not rendering the SiteFooter here since it looks like it requires additional setup
  // not available in the logged out state (errors with InjectIntl errors)
  if (!authenticatedUser) {
    return <UnauthenticatedRoot />;
  }

  if (!isAppDataHydrated) {
    return null;
  }

  // User is authenticated, so render the child routes (rest of the app).
  return <AuthenticatedRoot />;
};

export default Root;
