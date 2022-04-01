import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import useHotjar from 'react-use-hotjar';
import { AppProvider, AuthenticatedPageRoute, PageRoute } from '@edx/frontend-platform/react';

import NotFoundPage from '../NotFoundPage';
import EnterpriseAppPageRoutes from './EnterpriseAppPageRoutes';
import NoticesProvider from '../notices-provider';
import {
  EnterpriseCustomerRedirect,
  EnterprisePageRedirect,
} from '../enterprise-redirects';
import { LicenseActivationPage } from '../license-activation';
import { EnterpriseInvitePage } from '../enterprise-invite';
import { ToastsProvider, Toasts } from '../Toasts';

export default function App() {
  if (process.env.HOTJAR_APP_ID) {
    const { initHotjar } = useHotjar();
    useEffect(() => {
      initHotjar(process.env.HOTJAR_APP_ID, process.env.HOTJAR_VERSION, process.env.HOTJAR_DEBUG);
    }, [initHotjar]);
  }

  return (
    <AppProvider>
      <NoticesProvider>
        <ToastsProvider>
          <Toasts />
          <Switch>
            <AuthenticatedPageRoute exact path="/" component={EnterpriseCustomerRedirect} />
            <AuthenticatedPageRoute exact path="/r/:redirectPath+" component={EnterprisePageRedirect} />
            <PageRoute exact path="/invite/:enterpriseCustomerInviteKey" component={EnterpriseInvitePage} />
            <PageRoute exact path="/:enterpriseSlug/licenses/:activationKey/activate" component={LicenseActivationPage} />
            <Route path="/:enterpriseSlug" component={EnterpriseAppPageRoutes} />
            <PageRoute path="*" component={NotFoundPage} />
          </Switch>
        </ToastsProvider>
      </NoticesProvider>
    </AppProvider>
  );
}
