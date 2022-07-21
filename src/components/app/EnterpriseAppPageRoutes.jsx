import React from 'react';
import { PageRoute } from '@edx/frontend-platform/react';

import { DashboardPage } from '../dashboard';
import { CoursePage } from '../course';
import { SearchPage } from '../search';
import { SkillsQuizPage } from '../skills-quiz';
import { ProgramPage } from '../program';
import { ProgramProgressPage } from '../program-progress';
import AuthenticatedUserSubsidyPage from './AuthenticatedUserSubsidyPage';
import { features } from '../../config';
import { LicenseActivationPage } from '../license-activation';

const EnterpriseAppPageRoutes = () => (
  <>
    <AuthenticatedUserSubsidyPage>
      <PageRoute exact path="/:enterpriseSlug" component={DashboardPage} />
      <PageRoute
        exact
        path={['/:enterpriseSlug/search', '/:enterpriseSlug/search/:pathwayUUID']}
        component={SearchPage}
      />
      <PageRoute exact path="/:enterpriseSlug/course/:courseKey" component={CoursePage} />
      {features.ENABLE_PROGRAMS && (
        <PageRoute exact path="/:enterpriseSlug/program/:programUuid" component={ProgramPage} />
      )}
      <PageRoute exact path="/:enterpriseSlug/program-progress/:programUUID" component={ProgramProgressPage} />
      <PageRoute exact path="/:enterpriseSlug/skills-quiz" component={SkillsQuizPage} />
      <PageRoute exact path="/:enterpriseSlug/licenses/:activationKey/activate" component={LicenseActivationPage} />
    </AuthenticatedUserSubsidyPage>
  </>
);

export default EnterpriseAppPageRoutes;
