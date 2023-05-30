import React, { useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { AppProvider, AuthenticatedPageRoute, PageRoute } from '@edx/frontend-platform/react';
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

// Create a query client for @tanstack/react-query
const queryClient = new QueryClient();

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
            <Switch>
              {/* always remove trailing slashes from any route */}
              <Redirect from="/:url*(/+)" to={global.location.pathname.slice(0, -1)} />
              {/* page routes for the app */}
              <AuthenticatedPageRoute exact path="/" component={EnterpriseCustomerRedirect} />
              <AuthenticatedPageRoute exact path="/r/:redirectPath+" component={EnterprisePageRedirect} />
              <PageRoute exact path="/invite/:enterpriseCustomerInviteKey" component={EnterpriseInvitePage} />
              <PageRoute
                exact
                path="/:enterpriseSlug/executive-education-2u"
                render={(routeProps) => (
                  <AuthenticatedPage>
                    <ExecutiveEducation2UPage {...routeProps} />
                  </AuthenticatedPage>
                )}
              />
              <PageRoute
                exact
                path="/:enterpriseSlug/executive-education-2u/enrollment-completed"
                render={(routeProps) => (
                  <AuthenticatedPage>
                    <EnrollmentCompleted {...routeProps} />
                  </AuthenticatedPage>
                )}
              />
              <Route path="/:enterpriseSlug" component={EnterpriseAppPageRoutes} />
              <PageRoute path="*" component={NotFoundPage} />
            </Switch>
          </ToastsProvider>
        </NoticesProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
