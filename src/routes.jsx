import { matchPath, Outlet } from 'react-router-dom';
import { PageWrap } from '@edx/frontend-platform/react';

import RouteErrorBoundary from './components/app/routes/RouteErrorBoundary';
import Root from './components/app/Root';
import Layout from './components/app/Layout';
import { makeRootLoader } from './components/app/routes/loaders';
import NotFoundPage from './components/NotFoundPage';

function getRouteLoader(routeLoaderFn, queryClient) {
  if (!queryClient) {
    return null;
  }
  return routeLoaderFn(queryClient);
}

function getEnterpriseSlugRoutes({ queryClient, hasNotFoundRoutes }) {
  const enterpriseSlugChildRoutes = [
    {
      index: true,
      lazy: async () => {
        const { DashboardPage, makeDashboardLoader } = await import('./components/dashboard');
        return {
          Component: DashboardPage,
          loader: getRouteLoader(makeDashboardLoader, queryClient),
        };
      },
      errorElement: (
        <RouteErrorBoundary
          showSiteHeader={false}
          showSiteFooter={false}
        />
      ),
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
      errorElement: (
        <RouteErrorBoundary
          showSiteHeader={false}
          showSiteFooter={false}
        />
      ),
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
      errorElement: (
        <RouteErrorBoundary
          showSiteHeader={false}
          showSiteFooter={false}
        />
      ),
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
      errorElement: (
        <RouteErrorBoundary
          showSiteHeader={false}
          showSiteFooter={false}
        />
      ),
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
      errorElement: (
        <RouteErrorBoundary
          showSiteHeader={false}
          showSiteFooter={false}
        />
      ),
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
      errorElement: (
        <RouteErrorBoundary
          showSiteHeader={false}
          showSiteFooter={false}
        />
      ),
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
      errorElement: (
        <RouteErrorBoundary
          showSiteHeader={false}
          showSiteFooter={false}
        />
      ),
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
      errorElement: (
        <RouteErrorBoundary
          showSiteHeader={false}
          showSiteFooter={false}
        />
      ),
    },
  ];
  if (hasNotFoundRoutes) {
    enterpriseSlugChildRoutes.push({
      path: '*',
      element: <NotFoundPage />,
    });
  }
  const enterpriseSlugRoutes = [
    {
      path: ':enterpriseSlug?',
      loader: getRouteLoader(makeRootLoader, queryClient),
      element: <Layout />,
      children: enterpriseSlugChildRoutes,
    },
  ];
  return enterpriseSlugRoutes;
}

function getOtherRoutes() {
  const otherRoutes = [
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

export function getRoutes({ queryClient, options = {} }) {
  const {
    hasNotFoundRoutes = true,
  } = options;
  const enterpriseSlugRoutes = getEnterpriseSlugRoutes({ queryClient, hasNotFoundRoutes });
  const rootChildRoutes = [
    ...getOtherRoutes(),
    ...enterpriseSlugRoutes,
  ];
  if (hasNotFoundRoutes) {
    rootChildRoutes.push({
      path: '*',
      element: <NotFoundPage />,
    });
  }

  const routes = [
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
  };
}

export function extractPaths(routes, basePath = '/') {
  let paths = [];
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
    if (route.children?.length > 0) {
      paths = [...paths, ...extractPaths(route.children, `${currentPath}/`)];
    }
  });

  return paths;
}

export function replaceRouteParamsInPath(viewPath, routePaths) {
  let viewPathCopy = viewPath;
  // Replace all dynamic route parameter in the view path with '?'
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
