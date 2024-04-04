import { PageWrap } from '@edx/frontend-platform/react';
import {
  Route, createBrowserRouter, createRoutesFromElements, Outlet,
} from 'react-router-dom';

import RouteErrorBoundary from './RouteErrorBoundary';
import { makeRootLoader } from './loaders';
import Root from '../Root';
import Layout from '../Layout';
import NotFoundPage from '../../NotFoundPage';

/**
 * TODO
 * @param {Object} queryClient
 * @returns
 */
export default function createAppRouter(queryClient) {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={<PageWrap><Root /></PageWrap>}
        errorElement={<RouteErrorBoundary />}
      >
        <Route
          path="invite/:enterpriseCustomerInviteKey"
          lazy={async () => {
            const {
              default: EnterpriseInviteRoute,
              makeEnterpriseInviteLoader,
            } = await import('./EnterpriseInviteRoute');
            return {
              Component: EnterpriseInviteRoute,
              loader: makeEnterpriseInviteLoader(),
            };
          }}
        />
        <Route
          path=":enterpriseSlug?"
          loader={makeRootLoader(queryClient)}
          element={<Layout />}
        >
          <Route
            index
            lazy={async () => {
              const { DashboardPage, makeDashboardLoader } = await import('../../dashboard');
              return {
                Component: DashboardPage,
                loader: makeDashboardLoader(queryClient),
              };
            }}
            errorElement={(
              <RouteErrorBoundary
                showSiteHeader={false}
                showSiteFooter={false}
              />
            )}
          />
          <Route
            path="search/:pathwayUUID?"
            lazy={async () => {
              const { SearchPage, makeSearchLoader } = await import('../../search');
              return {
                Component: SearchPage,
                loader: makeSearchLoader(queryClient),
              };
            }}
            errorElement={(
              <RouteErrorBoundary
                showSiteHeader={false}
                showSiteFooter={false}
              />
            )}
          />
          <Route
            path="academies/:academyUUID"
            lazy={async () => {
              const { makeAcademiesLoader, AcademyDetailPage } = await import('../../academies');
              return {
                Component: AcademyDetailPage,
                loader: makeAcademiesLoader(queryClient),
              };
            }}
            errorElement={(
              <RouteErrorBoundary
                showSiteHeader={false}
                showSiteFooter={false}
              />
            )}
          />
          <Route
            path="pathway/:pathwayUUID/progress"
            lazy={async () => {
              const { PathwayProgressPage } = await import('../../pathway-progress');
              return {
                Component: PathwayProgressPage,
              };
            }}
            errorElement={(
              <RouteErrorBoundary
                showSiteHeader={false}
                showSiteFooter={false}
              />
            )}
          />
          <Route
            path="program/:programUUID"
            element={<Outlet />}
            errorElement={(
              <RouteErrorBoundary
                showSiteHeader={false}
                showSiteFooter={false}
              />
            )}
          >
            <Route
              index
              lazy={async () => {
                const { ProgramPage, makeProgramLoader } = await import('../../program');
                return {
                  Component: ProgramPage,
                  loader: makeProgramLoader(queryClient),
                };
              }}
            />
            <Route
              path="progress"
              lazy={async () => {
                const { ProgramProgressPage, makeProgramProgressLoader } = await import('../../program-progress');
                return {
                  Component: ProgramProgressPage,
                  loader: makeProgramProgressLoader(queryClient),
                };
              }}
            />
          </Route>
          <Route
            path="skills-quiz"
            lazy={async () => {
              const { SkillsQuizPage } = await import('../../skills-quiz');
              return {
                Component: SkillsQuizPage,
              };
            }}
            errorElement={(
              <RouteErrorBoundary
                showSiteHeader={false}
                showSiteFooter={false}
              />
            )}
          />
          <Route
            path=":courseType?/course/:courseKey/*"
            lazy={async () => {
              const { CoursePage, makeCourseLoader } = await import('../../course');
              return {
                Component: CoursePage,
                loader: makeCourseLoader(queryClient),
              };
            }}
            errorElement={(
              <RouteErrorBoundary
                showSiteHeader={false}
                showSiteFooter={false}
              />
            )}
          >
            <Route
              index
              lazy={async () => {
                const { default: CourseAbout } = await import('../../course/routes/CourseAbout');
                return {
                  Component: CourseAbout,
                };
              }}
            />
            <Route
              path="enroll/:courseRunKey"
              element={<Outlet />}
            >
              <Route
                index
                lazy={async () => {
                  const {
                    default: ExternalCourseEnrollment,
                    makeExternalCourseEnrollmentLoader,
                  } = await import('../../course/routes/ExternalCourseEnrollment');
                  return {
                    Component: ExternalCourseEnrollment,
                    loader: makeExternalCourseEnrollmentLoader(queryClient),
                  };
                }}
              />
              <Route
                path="complete"
                lazy={async () => {
                  const { default: ExternalCourseEnrollmentConfirmation } = await import('../../course/routes/ExternalCourseEnrollmentConfirmation');
                  return {
                    Component: ExternalCourseEnrollmentConfirmation,
                  };
                }}
              />
            </Route>
          </Route>
          <Route
            path="licenses/:activationKey/activate"
            lazy={async () => {
              const { default: LicenseActivationRoute } = await import('./LicenseActivationRoute');
              return {
                Component: LicenseActivationRoute,
              };
            }}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>,
    ),
  );
  return router;
}
