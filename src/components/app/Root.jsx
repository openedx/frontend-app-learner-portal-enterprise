import { Component, Suspense, useContext } from 'react';
import PropTypes from 'prop-types';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { Hyperlink } from '@openedx/paragon';

import { Toasts, ToastsProvider } from '../Toasts';
import { ErrorPage } from '../error-page';
import RouterFallback from './routes/RouterFallback';
import { useNProgressLoader } from './data';

const UnauthenticatedRoot = () => (
  <ErrorPage title="You are now logged out." showSiteFooter={false}>
    Please log back in {' '}
    <Hyperlink destination={getLoginRedirectUrl(global.location.href)}>
      here.
    </Hyperlink>
  </ErrorPage>
);

class SuspenseErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    const isSuspenseError = ['suspended while rendering', 'no fallback UI was specified'].every(
      (str) => error.message.includes(str),
    );
    if (!isSuspenseError) {
      // This is not a suspense error, so we should not handle it here.
      return;
    }
    this.setState({ hasError: true });
    logError(
      '[SuspenseErrorBoundary]: A component/hook suspended unexpectedly. Please verify that query data is pre-fetched via route loaders, where applicable.',
      {
        message: error,
        componentStack: errorInfo.componentStack,
      },
    );
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <Suspense fallback={<RouterFallback />}>
        {this.props.children}
      </Suspense>
    );
  }
}

SuspenseErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const AuthenticatedRoot = () => (
  <>
    <ToastsProvider>
      <Toasts />
      <SuspenseErrorBoundary>
        <Outlet />
      </SuspenseErrorBoundary>
    </ToastsProvider>
    <ScrollRestoration />
  </>
);

const Root = () => {
  const { authenticatedUser } = useContext(AppContext);
  const isAppDataHydrated = useNProgressLoader();

  throw new Error('oh noes!');

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
