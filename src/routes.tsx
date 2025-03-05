import { matchPath, Outlet } from 'react-router-dom';
import { PageWrap } from '@edx/frontend-platform/react';

import RouteErrorBoundary from './components/app/routes/RouteErrorBoundary';
import Root from './components/app/Root';
import Layout from './components/app/Layout';
import { makeRootLoader } from './components/app/routes/loaders';
import NotFoundPage from './components/NotFoundPage';
import AppErrorBoundary from './components/app/AppErrorBoundary';

/**
 * Returns the route loader function if a queryClient is available; otherwise, returns null.
 */
export function getRouteLoader(makeRouteLoaderFn: Types.MakeRouteLoaderFunction, queryClient?: Types.QueryClient) {
  if (!queryClient) {
    return undefined;
  }
  return makeRouteLoaderFn(queryClient);
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
        const { makeAcademiesLoader, AcademyPage } = await import('./components/academies');
        return {
          Component: AcademyPage,
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
          loader: getRouteLoader(makeVideosLoader, queryClient),
        };
      },
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ];
  const enterpriseSlugRoutes: Types.RouteObject[] = [
    {
      path: ':enterpriseSlug?',
      loader: getRouteLoader(makeRootLoader, queryClient),
      element: <Layout />,
      children: enterpriseSlugChildRoutes,
      shouldRevalidate: ({ currentUrl, nextUrl, defaultShouldRevalidate }) => {
        // If the pathname changed, we should revalidate
        if (currentUrl.pathname !== nextUrl.pathname) {
          return true;
        }

        // If the pathname didn't change, fallback to the default behavior
        return defaultShouldRevalidate;
      },
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
    {
      /**
       * We want to support a slug-"aware" version of the invite key route,
       * but we don't want it nested under the root loader via
       * enterpriseSlugRoutes above. Putting this route under the root loader
       * would mean that the post-registration redirect back to this route
       * would run through the root loader logic with a now-authenticated-but-unlinked
       * requesting user, which will throw a 404 (until the async call to
       * `link-user/` resolves and the page is reloaded).
       */
      path: ':enterpriseSlug/invite/:enterpriseCustomerInviteKey',
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
      element: (
        <PageWrap>
          <AppErrorBoundary>
            <Root />
          </AppErrorBoundary>
        </PageWrap>
      ),
      children: rootChildRoutes,
      errorElement: <RouteErrorBoundary />,
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
 * Traverses a nested route structure, building up route paths based on each route's
 * configuration and its children, and collects all these paths in an array. The result
 * is a flattened array of all possible paths in the route structure.
 *
 * @example
 * Input:
 *
 * const routes = [
 *   {
 *     path: '/:enterpriseSlug?',
 *     element: <Outlet />, // Outlet renders child route(s)
 *     loader: [() => {}],
 *     children: [
 *       {
 *         index: true,
 *         element: <Dashboard />,
 *       },
 *       {
 *         path: 'search',
 *         element: <Search />,
 *       },
 *       {
 *         path: ':courseType?/course/:courseKey',
 *         element: <Outlet />,
 *         children: [
 *           {
 *             index: true,
 *             element: <CourseAbout />,
 *           },
 *           {
 *             path: 'enroll/:courseRunKey',
 *             element: <CourseEnroll />,
 *           },
 *         ],
 *       },
 *     ]
 *   }
 * ];
 *
 * Output:
 *
 * [
 *   '/:enterpriseSlug?',
 *   '/:enterpriseSlug?/search',
 *   '/:enterpriseSlug?/:courseType?/course/:courseKey',
 *   '/:enterpriseSlug?/:courseType?/course/:courseKey/enroll/:courseRunKey',
 * ]
 */
export function flattenRoutePaths(routes: Types.RouteObject[], basePath = '/') {
  let paths: string[] = [];
  routes.forEach((route) => {
    // Construct the full path by combining basePath with route.path
    const fullPath = `${basePath}${(route.path || '')}`;

    // Add the full path to the result if the route has a path
    if (route.path) {
      paths.push(fullPath);
    }

    // Recursively process the route's children (if any)
    if (Array.isArray(route.children)) {
      paths = paths.concat(flattenRoutePaths(route.children, `${fullPath}/`));
    }
  });
  return paths;
}

/**
 * Replaces all dynamic route parameters in the view path.
 */
export function replaceRouteParamsInPath(viewPath: string, routePaths: string[]) {
  let viewPathCopy = viewPath;
  routePaths.forEach((routePath) => {
    if (routePath.includes('*')) {
      // skip wildcard routes
      return;
    }
    const matchResult = matchPath(routePath, viewPathCopy);
    if (!matchResult) {
      return;
    }
    const routeParams = matchResult.params;
    Object.values(routeParams).forEach((value) => {
      if (!value) {
        return;
      }
      // Use the value of the MASKED_ROUTE_PARAM_VALUE environment variable if it is set; otherwise, use '?'
      const maskedRouteParamValue = process.env.MASKED_ROUTE_PARAM_VALUE ? process.env.MASKED_ROUTE_PARAM_VALUE : '?';
      viewPathCopy = viewPathCopy.replace(value, maskedRouteParamValue);
    });
  });
  return viewPathCopy;
}
