import { PageWrap } from '@edx/frontend-platform/react';
import {
  Route, createBrowserRouter, createRoutesFromElements,
} from 'react-router-dom';

import RouteErrorBoundary from './RouteErrorBoundary';
import {
  makeCourseLoader,
  makeRootLoader,
} from './loaders';
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
            path="program/:programUUID"
            lazy={() => {
              const { ProgramPage } = import('../../program');
              return {
                Component: ProgramPage,
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
              path="progress"
              lazy={async () => {
                const { ProgramProgressPage, makeProgramProgressLoader } = await import('../../program-progress');
                return {
                  Component: ProgramProgressPage,
                  loader: makeProgramProgressLoader(queryClient),
                };
              }}
              errorElement={(
                <RouteErrorBoundary
                  showSiteHeader={false}
                  showSiteFooter={false}
                />
              )}
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
              const { default: CourseRoute } = await import('./CourseRoute');
              return {
                Component: CourseRoute,
                loader: makeCourseLoader(queryClient),
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
