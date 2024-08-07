import {
  matchPath, Outlet,
} from 'react-router-dom';
import { PageWrap } from '@edx/frontend-platform/react';

import RouteErrorBoundary from './components/app/routes/RouteErrorBoundary';
import Root from './components/app/Root';
import Layout from './components/app/Layout';
import { makeRootLoader } from './components/app/routes/loaders';
import NotFoundPage from './components/NotFoundPage';

/**
 * Returns the route loader function if a queryClient is available; otherwise, returns null.
 */
function getRouteLoader(routeLoaderFn: Types.RouteLoaderFunction, queryClient?: Types.QueryClient) {
  if (!queryClient) {
    return undefined;
  }
  return routeLoaderFn(queryClient);
}

/**
 * Returns the routes nested under the enterprise slug prefix.
 */
function getEnterpriseSlugRoutes(queryClient?: Types.QueryClient) {
  const enterpriseSlugChildRoutes: Types.RouteObject[] = [
    {
      index: true,
      lazy: async () => {
        const { DashboardPage, makeDashboardLoader } = await import('./components/dashboard');
        return {
          Component: DashboardPage,
          loader: getRouteLoader(makeDashboardLoader, queryClient),
        };
      },
    },
    {
      path: 'search/:pathwayUUID?',
      lazy: async () => {
        const { SearchPage, makeSearchLoader } = await import('./components/search');
        return {
          Component: SearchPage,
          loader: getRouteLoader(makeSearchLoader, queryClient),
        };
      },
    },
    {
      path: 'academies/:academyUUID',
      lazy: async () => {
        const { makeAcademiesLoader, AcademyDetailPage } = await import('./components/academies');
        return {
          Component: AcademyDetailPage,
          loader: getRouteLoader(makeAcademiesLoader, queryClient),
        };
      },
    },
    {
      path: 'pathway/:pathwayUUID/progress',
      lazy: async () => {
        const { PathwayProgressPage, makePathwayProgressLoader } = await import('./components/pathway-progress');
        return {
          Component: PathwayProgressPage,
          loader: getRouteLoader(makePathwayProgressLoader, queryClient),
        };
      },
    },
    {
      path: 'program/:programUUID',
      element: <Outlet />,
      children: [
        {
          index: true,
          lazy: async () => {
            const { ProgramPage, makeProgramLoader } = await import('./components/program');
            return {
              Component: ProgramPage,
              loader: getRouteLoader(makeProgramLoader, queryClient),
            };
          },
        },
        {
          path: 'progress',
          lazy: async () => {
            const { ProgramProgressPage, makeProgramProgressLoader } = await import('./components/program-progress');
            return {
              Component: ProgramProgressPage,
              loader: getRouteLoader(makeProgramProgressLoader, queryClient),
            };
          },
        },
      ],
    },
    {
      path: 'skills-quiz',
      lazy: async () => {
        const { SkillsQuizPage } = await import('./components/skills-quiz');
        return {
          Component: SkillsQuizPage,
        };
      },
    },
    {
      path: ':courseType?/course/:courseKey',
      lazy: async () => {
        const { CoursePage, makeCourseLoader } = await import('./components/course');
        return {
          Component: CoursePage,
          loader: getRouteLoader(makeCourseLoader, queryClient),
        };
      },
      children: [
        {
          index: true,
          lazy: async () => {
            const { default: CourseAbout } = await import('./components/course/routes/CourseAbout');
            return {
              Component: CourseAbout,
            };
          },
        },
        {
          path: 'enroll/:courseRunKey',
          element: <Outlet />,
          children: [
            {
              index: true,
              lazy: async () => {
                const {
                  default: ExternalCourseEnrollment,
                  makeExternalCourseEnrollmentLoader,
                } = await import('./components/course/routes/ExternalCourseEnrollment');
                return {
                  Component: ExternalCourseEnrollment,
                  loader: getRouteLoader(makeExternalCourseEnrollmentLoader, queryClient),
                };
              },
            },
            {
              path: 'complete',
              lazy: async () => {
                const { default: ExternalCourseEnrollmentConfirmation } = await import('./components/course/routes/ExternalCourseEnrollmentConfirmation');
                return {
                  Component: ExternalCourseEnrollmentConfirmation,
                };
              },
            },
          ],
        },
      ],
    },
    {
      path: 'licenses/:activationKey/activate',
      lazy: async () => {
        const { default: LicenseActivationRoute } = await import('./components/app/routes/LicenseActivationRoute');
        return {
          Component: LicenseActivationRoute,
        };
      },
    },
    {
      path: 'videos/:videoUUID',
      lazy: async () => {
        const { makeVideosLoader, VideoDetailPage } = await import('./components/microlearning');
        return {
          Component: VideoDetailPage,
          loader: makeVideosLoader(queryClient),
        };
      },
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ].map((enterpriseSlugRoute: Types.RouteObject) : Types.RouteObject => {
    if (enterpriseSlugRoute.path === '*') {
      return enterpriseSlugRoute;
    }
    return {
      ...enterpriseSlugRoute,
      errorElement: (
        <RouteErrorBoundary
          showSiteHeader={false}
          showSiteFooter={false}
        />
      ),
    };
  });
  const enterpriseSlugRoutes: Types.RouteObject[] = [
    {
      path: ':enterpriseSlug?',
      loader: getRouteLoader(makeRootLoader, queryClient),
      element: <Layout />,
      children: enterpriseSlugChildRoutes,
    },
  ];
  return enterpriseSlugRoutes;
}

/**
 * Returns other routes that are not nested under the enterprise slug prefix.
 */
function getOtherRoutes() {
  const otherRoutes: Types.RouteObject[] = [
    {
      path: 'invite/:enterpriseCustomerInviteKey',
      lazy: async () => {
        const {
          default: EnterpriseInviteRoute,
          makeEnterpriseInviteLoader,
        } = await import('./components/app/routes/EnterpriseInviteRoute');
        return {
          Component: EnterpriseInviteRoute,
          loader: makeEnterpriseInviteLoader(),
        };
      },
    },
  ];
  return otherRoutes;
}

/**
 * Returns the routes for the application.
 */
export function getRoutes(queryClient?: Types.QueryClient) {
  const enterpriseSlugRoutes = getEnterpriseSlugRoutes(queryClient);
  const otherRoutes = getOtherRoutes();
  const rootChildRoutes: Types.RouteObject[] = [
    ...otherRoutes,
    ...enterpriseSlugRoutes,
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ];

  const routes: Types.RouteObject[] = [
    {
      path: '/',
      element: <PageWrap><Root /></PageWrap>,
      errorElement: <RouteErrorBoundary />,
      children: rootChildRoutes,
    },
  ];

  return {
    routes,
    rootChildRoutes,
    enterpriseSlugRoutes,
    otherRoutes,
  };
}

/**
 * Extracts all the (nested) route paths from the given routes.
 */
export function extractRoutePaths(routes: Types.RouteObject[], basePath = '/') {
  let paths: string[] = [];
  routes.forEach((route) => {
    let currentPath = basePath;

    // Append the current route's path to the base path
    if (route.path) {
      currentPath += route.path;
    }

    if (!route.index) {
      paths.push(currentPath);
    }

    // Recursively handle nested routes (children)
    if (route.children?.length) {
      paths = [...paths, ...extractRoutePaths(route.children, `${currentPath}/`)];
    }
  });
  return paths;
}

/**
 * Replaces all dynamic route parameters in the view path with '?'.
 */
export function replaceRouteParamsInPath(viewPath: string, routePaths: string[]) {
  let viewPathCopy = viewPath;
  routePaths.forEach((routePath) => {
    const matchResult = matchPath(routePath, viewPathCopy);
    if (!matchResult) {
      return;
    }
    const routeParams = matchResult.params;
    Object.values(routeParams).forEach((value) => {
      if (!value) {
        return;
      }
      viewPathCopy = viewPathCopy.replaceAll(value, '?');
    });
  });
  return viewPathCopy;
}
