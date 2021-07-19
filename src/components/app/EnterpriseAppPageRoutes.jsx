import React from 'react';
import { PageRoute } from '@edx/frontend-platform/react';

import { DashboardPage } from '../dashboard';
import { CoursePage } from '../course';
import { SearchPage } from '../search';
import { SkillsQuizPage } from '../skills-quiz';

import AuthenticatedUserSubsidyPage from './AuthenticatedUserSubsidyPage';

const EnterpriseAppPageRoutes = () => (
  <>
    <AuthenticatedUserSubsidyPage>
      <PageRoute exact path="/:enterpriseSlug" component={DashboardPage} />
      <PageRoute exact path="/:enterpriseSlug/search" component={SearchPage} />
      <PageRoute exact path="/:enterpriseSlug/course/:courseKey" component={CoursePage} />
      <PageRoute exact path="/:enterpriseSlug/skills-quiz" component={SkillsQuizPage} />
    </AuthenticatedUserSubsidyPage>
  </>
);

export default EnterpriseAppPageRoutes;
