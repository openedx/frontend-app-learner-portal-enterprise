import { lazy, Suspense } from 'react';
import { PageWrap } from '@edx/frontend-platform/react';
import { Route, Routes } from 'react-router-dom';

import AuthenticatedUserSubsidyPage from './AuthenticatedUserSubsidyPage';
import { features } from '../../config';
import extractNamedExport from '../../utils/extract-named-export';
import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';

const DashboardPage = lazy(() => extractNamedExport(import(/* webpackChunkName: "dashboard" */ '../dashboard'), 'DashboardPage'));
const SearchPage = lazy(() => extractNamedExport(import(/* webpackChunkName: "search" */ '../search'), 'SearchPage'));
const CoursePage = lazy(() => extractNamedExport(import(/* webpackChunkName: "course" */ '../course'), 'CoursePage'));
const ProgramPage = lazy(() => extractNamedExport(import(/* webpackChunkName: "program" */ '../program'), 'ProgramPage'));
const ProgramProgressRedirect = lazy(() => extractNamedExport(import(/* webpackChunkName: "program-progress-redirect" */ '../program-progress'), 'ProgramProgressRedirect'));
const ProgramProgressPage = lazy(() => extractNamedExport(import(/* webpackChunkName: "program-progress" */ '../program-progress'), 'ProgramProgressPage'));
const SkillsQuizPage = lazy(() => extractNamedExport(import(/* webpackChunkName: "skills-quiz" */ '../skills-quiz'), 'SkillsQuizPage'));
const PathwayProgressPage = lazy(() => extractNamedExport(import(/* webpackChunkName: "pathway-progress" */ '../pathway-progress'), 'PathwayProgressPage'));
const AcademyDetailPage = lazy(() => extractNamedExport(import(/* webpackChunkName: "academy" */ '../academies'), 'AcademyDetailPage'));

// TODO: Techdebt, Create Context wrapper around this component for enterpriseCurations
// to reduce API calls by 2 (DashboardPage, CoursePage, SearchPage) or by 3 ( + AuthenticatedPage) if created in App.jsx
const EnterpriseAppPageRoutes = () => (
  <AuthenticatedUserSubsidyPage>
    <Suspense fallback={(
      <DelayedFallbackContainer
        className="py-5 d-flex justify-content-center align-items-center"
      />
    )}
    >
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
        {/* Deprecated URL, will be removed in the future. */}
        <Route path="program-progress/:programUUID" element={<PageWrap><ProgramProgressRedirect /></PageWrap>} /> {/* RIP OUT */}
        <Route path="program/:programUUID/progress" element={<PageWrap><ProgramProgressPage /></PageWrap>} />
        <Route path="skills-quiz" element={<PageWrap><SkillsQuizPage /></PageWrap>} />
        {features.FEATURE_ENABLE_PATHWAY_PROGRESS && (
          <Route exact path="pathway/:pathwayUUID/progress" element={<PageWrap><PathwayProgressPage /></PageWrap>} />
        )}
        <Route path="academies/:academyUUID" element={<AcademyDetailPage />} />
      </Routes>
    </Suspense>
  </AuthenticatedUserSubsidyPage>
);

export default EnterpriseAppPageRoutes;
