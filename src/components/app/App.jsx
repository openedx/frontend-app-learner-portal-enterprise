import React, { useEffect } from 'react';
import { Switch } from 'react-router-dom';
import useHotjar from 'react-use-hotjar';
import { AppProvider, AuthenticatedPageRoute, PageRoute } from '@edx/frontend-platform/react';

import NotFoundPage from '../NotFoundPage';
import NoticesProvider from '../notices-provider';
import {
  EnterprisePageRedirect,
} from '../enterprise-redirects';
import { DashboardPage } from '../dashboard';
import { CoursePage } from '../course';
import { ProgramPage } from '../program';
import ProgramProgressPage from '../program-progress/ProgramProgressPage';
import { SearchPage } from '../search';
import { SkillsQuizPage } from '../skills-quiz';
import { EnterpriseInvitePage } from '../enterprise-invite';

import { features } from '../../config';
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
            <AuthenticatedPageRoute exact path="/r/:redirectPath+" component={EnterprisePageRedirect} />
            <PageRoute exact path="/invite/:enterpriseCustomerInviteKey" component={EnterpriseInvitePage} />
            <PageRoute exact path="/" component={DashboardPage} />
            <PageRoute exact path="/search" component={SearchPage} />
            <PageRoute exact path="/:enterpriseSlug/course/:courseKey" component={CoursePage} />
            {features.ENABLE_PROGRAMS && (
              <PageRoute exact path="/:enterpriseSlug/program/:programUuid" component={ProgramPage} />
            )}
            <PageRoute exact path="/:enterpriseSlug/program-progress/:programUUID" component={ProgramProgressPage} />
            <PageRoute exact path="/:enterpriseSlug/skills-quiz" component={SkillsQuizPage} />
            <PageRoute path="*" component={NotFoundPage} />
          </Switch>
        </ToastsProvider>
      </NoticesProvider>
    </AppProvider>
  );
}
