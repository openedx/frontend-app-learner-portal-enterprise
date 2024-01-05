import React from 'react';
import { PageWrap } from '@edx/frontend-platform/react';
import { Route, Routes } from 'react-router-dom';

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
    <Routes>
      <Route path="/" element={<PageWrap><DashboardPage /></PageWrap>} />
      {['search', 'search/:pathwayUUID'].map(route => (
        <Route
          key={route}
          path={route}
          element={<PageWrap><SearchPage /></PageWrap>}
        />
      ))}
      <Route path="course/:courseKey/*" element={<PageWrap><CoursePage /></PageWrap>} />
      <Route path=":courseType/course/:courseKey/*" element={<PageWrap><CoursePage /></PageWrap>} />
      {features.ENABLE_PROGRAMS && (
        <Route path="program/:programUuid" element={<PageWrap><ProgramPage /></PageWrap>} />
      )}
      {
      // Deprecated URL, will be removed in the future.
        <Route path="program-progress/:programUUID" element={<PageWrap><ProgramProgressRedirect /></PageWrap>} />
      }
      <Route path="program/:programUUID/progress" element={<PageWrap><ProgramProgressPage /></PageWrap>} />
      <Route path="skills-quiz" element={<PageWrap><SkillsQuizPage /></PageWrap>} />
      <Route path="licenses/:activationKey/activate" element={<PageWrap><LicenseActivationPage /></PageWrap>} />
      {features.FEATURE_ENABLE_PATHWAY_PROGRESS && (
        <Route exact path="pathway/:pathwayUUID/progress" element={<PageWrap><PathwayProgressPage /></PageWrap>} />
      )}
      <Route path="academies/:academyUUID" element={<AcademyDetailPage />} />
    </Routes>
  </AuthenticatedUserSubsidyPage>
);

export default EnterpriseAppPageRoutes;
