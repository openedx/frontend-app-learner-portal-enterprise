import React from 'react';
import { Route } from 'react-router-dom';
import { PageWrap } from '@edx/frontend-platform/react';

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

// TODO: Techdebt, Create Context wrapper around this component for enterpriseCurations
// to reduce API calls by 2 (DashboardPage, CoursePage, SearchPage) or by 3 ( + AuthenticatedPage) if created in App.jsx
const EnterpriseAppPageRoutes = () => (
  <AuthenticatedUserSubsidyPage>
    <Route exact path="/:enterpriseSlug" element={<PageWrap><DashboardPage /></PageWrap>} />
    <Route
      exact
      path={['/:enterpriseSlug/search', '/:enterpriseSlug/search/:pathwayUUID']}
      element={<PageWrap><SearchPage /></PageWrap>}
    />
    <Route exact path="/:enterpriseSlug/course/:courseKey" element={<PageWrap><CoursePage /></PageWrap>} />
    <Route path="/:enterpriseSlug/:courseType/course/:courseKey" element={<PageWrap><CoursePage /></PageWrap>} />
    {features.ENABLE_PROGRAMS && (
      <Route path="/:enterpriseSlug/program/:programUuid" element={<PageWrap><ProgramPage /></PageWrap>} />
    )}
    {
      // Deprecated URL, will be removed in the future.
      <Route exact path="/:enterpriseSlug/program-progress/:programUUID" element={<PageWrap><ProgramProgressRedirect /></PageWrap>} />
    }
    <Route exact path="/:enterpriseSlug/program/:programUUID/progress" element={<PageWrap><ProgramProgressPage /></PageWrap>} />
    <Route exact path="/:enterpriseSlug/skills-quiz" component={SkillsQuizPage} />
    <Route exact path="/:enterpriseSlug/licenses/:activationKey/activate" element={<PageWrap><LicenseActivationPage /></PageWrap>} />
    {features.FEATURE_ENABLE_PATHWAY_PROGRESS && (
      <Route exact path="/:enterpriseSlug/pathway/:pathwayUUID/progress" element={<PageWrap><PathwayProgressPage /></PageWrap>} />
    )}
  </AuthenticatedUserSubsidyPage>
);

export default EnterpriseAppPageRoutes;
