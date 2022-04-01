import React from 'react';
import { PageRoute } from '@edx/frontend-platform/react';

import { DashboardPage } from '../dashboard';
import { CoursePage } from '../course';
import { SearchPage } from '../search';
import { SkillsQuizPage } from '../skills-quiz';
import { ProgramPage } from '../program';
import { ProgramListingPage } from '../program-progress';
import ProgramProgressPage from '../program-progress/ProgramProgressPage';
import AuthenticatedUserSubsidyPage from './AuthenticatedUserSubsidyPage';
import { features } from '../../config';

const EnterpriseAppPageRoutes = () => (
  <>
    <AuthenticatedUserSubsidyPage>
      <PageRoute exact path="/:enterpriseSlug" component={DashboardPage} />
      <PageRoute exact path="/:enterpriseSlug/search" component={SearchPage} />
      <PageRoute exact path="/:enterpriseSlug/course/:courseKey" component={CoursePage} />
      {features.ENABLE_PROGRAMS && (
        <PageRoute exact path="/:enterpriseSlug/program/:programUuid" component={ProgramPage} />
      )}
      <PageRoute exact path="/:enterpriseSlug/program-progress/:programUUID" component={ProgramProgressPage} />
      {features.ENABLE_PROGRAM_PROGRESS_PAGE && (
        <PageRoute exact path="/:enterpriseSlug/programs" component={ProgramListingPage} />
      )}
      <PageRoute exact path="/:enterpriseSlug/skills-quiz" component={SkillsQuizPage} />
    </AuthenticatedUserSubsidyPage>
  </>
);

export default EnterpriseAppPageRoutes;
