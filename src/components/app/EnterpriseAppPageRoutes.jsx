import React from 'react';
import { PageRoute } from '@edx/frontend-platform/react';

import { DashboardPage } from '../dashboard';
import { CoursePage } from '../course';
import { SearchPage } from '../search';
import { SkillsQuizPage } from '../skills-quiz';
import { ProgramPage } from '../program';
import { ProgramProgressPage, ProgramProgressRedirect } from '../program-progress';
import AuthenticatedUserSubsidyPage from './AuthenticatedUserSubsidyPage';
import { features } from '../../config';
import { LicenseActivationPage } from '../license-activation';
import { PathwayProgressPage } from '../pathway-progress';
import { AcademyDetailPage } from '../academies';

// TODO: Techdebt, Create Context wrapper around this component for enterpriseCurations
// to reduce API calls by 2 (DashboardPage, CoursePage, SearchPage) or by 3 ( + AuthenticatedPage) if created in App.jsx
const EnterpriseAppPageRoutes = () => (
  <AuthenticatedUserSubsidyPage>
    <PageRoute exact path="/:enterpriseSlug" component={DashboardPage} />
    <PageRoute
      exact
      path={['/:enterpriseSlug/search', '/:enterpriseSlug/search/:pathwayUUID']}
      component={SearchPage}
    />
    <PageRoute exact path="/:enterpriseSlug/course/:courseKey" component={CoursePage} />
    <PageRoute path="/:enterpriseSlug/:courseType/course/:courseKey" component={CoursePage} />
    {features.ENABLE_PROGRAMS && (
      <PageRoute exact path="/:enterpriseSlug/program/:programUuid" component={ProgramPage} />
    )}
    {
      // Deprecated URL, will be removed in the future.
      <PageRoute exact path="/:enterpriseSlug/program-progress/:programUUID" component={ProgramProgressRedirect} />
    }
    <PageRoute exact path="/:enterpriseSlug/program/:programUUID/progress" component={ProgramProgressPage} />
    <PageRoute exact path="/:enterpriseSlug/skills-quiz" component={SkillsQuizPage} />
    <PageRoute exact path="/:enterpriseSlug/licenses/:activationKey/activate" component={LicenseActivationPage} />
    {features.FEATURE_ENABLE_PATHWAY_PROGRESS && (
      <PageRoute exact path="/:enterpriseSlug/pathway/:pathwayUUID/progress" component={PathwayProgressPage} />
    )}

    <PageRoute exact path="/:enterpriseSlug/academies/:academyUUID" component={AcademyDetailPage} />
  </AuthenticatedUserSubsidyPage>
);

export default EnterpriseAppPageRoutes;
