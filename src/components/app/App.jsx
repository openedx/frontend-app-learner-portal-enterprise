import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { AppProvider, AuthenticatedPageRoute, PageRoute } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { initializeHotjar } from '@edx/frontend-enterprise-hotjar';
import { Toasts, ToastsProvider } from '@edx/frontend-enterprise-toasts';

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

export default function App() {
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
    <AppProvider>
      <NoticesProvider>
        <ToastsProvider>
          <Toasts />
          <Switch>
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
            <Route path="/:enterpriseSlug" component={EnterpriseAppPageRoutes} />
            <PageRoute path="*" component={NotFoundPage} />
          </Switch>
        </ToastsProvider>
      </NoticesProvider>
    </AppProvider>
  );
}
