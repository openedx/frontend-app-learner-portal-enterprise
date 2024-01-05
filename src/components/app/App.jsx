import React, { useEffect } from 'react';
import {
  Routes, Route, Navigate, useLocation,
} from 'react-router-dom';
import { AppProvider, AuthenticatedPageRoute, PageWrap } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { initializeHotjar } from '@edx/frontend-enterprise-hotjar';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import AuthenticatedPage from './AuthenticatedPage';
import EnterpriseAppPageRoutes from './EnterpriseAppPageRoutes';
import NotFoundPage from '../NotFoundPage';
import NoticesProvider from '../notices-provider';
import {
  EnterpriseCustomerRedirect,
  EnterprisePageRedirect,
} from '../enterprise-redirects';
import { EnterpriseInvitePage } from '../enterprise-invite';
import { ExecutiveEducation2UPage } from '../executive-education-2u';
import { ToastsProvider, Toasts } from '../Toasts';
import EnrollmentCompleted from '../executive-education-2u/EnrollmentCompleted';
import { UserSubsidy } from '../enterprise-user-subsidy';

// Create a query client for @tanstack/react-query
const queryClient = new QueryClient();

const TruncatedLocation = () => {
  const location = useLocation();

  if (location.pathname.endsWith('/')) {
    return <Navigate to={location.pathname.slice(0, -1)} replace />;
  }
  return null;
};

const App = () => {
  // hotjar initialization
  useEffect(() => {
    if (process.env.HOTJAR_APP_ID) {
      try {
        initializeHotjar({
          hotjarId: process.env.HOTJAR_APP_ID,
          hotjarVersion: process.env.HOTJAR_VERSION,
          hotjarDebug: !!process.env.HOTJAR_DEBUG,
        });
      } catch (error) {
        logError(error);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <AppProvider>
        <NoticesProvider>
          <ToastsProvider>
            <Toasts />
            {/* always remove trailing slashes from any route */}
            <TruncatedLocation />
            {/* page routes for the app */}
            <Routes>
              <Route path="/" element={<AuthenticatedPageRoute><EnterpriseCustomerRedirect /></AuthenticatedPageRoute>} />
              <Route path="/r/*" element={<AuthenticatedPageRoute><EnterprisePageRedirect /></AuthenticatedPageRoute>} />
              <Route path="/invite/:enterpriseCustomerInviteKey" element={<PageWrap><EnterpriseInvitePage /></PageWrap>} />
              <Route
                path="/:enterpriseSlug/executive-education-2u"
                element={(
                  <PageWrap>
                    <AuthenticatedPage>
                      <UserSubsidy>
                        <ExecutiveEducation2UPage />
                      </UserSubsidy>
                    </AuthenticatedPage>
                  </PageWrap>
                )}
              />
              <Route
                path="/:enterpriseSlug/executive-education-2u/enrollment-completed"
                element={(
                  <PageWrap>
                    <AuthenticatedPage>
                      <UserSubsidy>
                        <EnrollmentCompleted />
                      </UserSubsidy>
                    </AuthenticatedPage>
                  </PageWrap>
                )}
              />
              <Route path="/:enterpriseSlug/*" element={<EnterpriseAppPageRoutes />} />
              <Route path="*" element={<PageWrap><NotFoundPage /></PageWrap>} />
            </Routes>
          </ToastsProvider>
        </NoticesProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
