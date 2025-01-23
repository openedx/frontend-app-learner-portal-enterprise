import {
  act,
  render, screen, waitFor,
} from '@testing-library/react';
import { Outlet, RouterProvider } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';

import createAppRouter from './createAppRouter';
import { queryClient } from '../../../utils/tests';
import { makeRootLoader } from './loaders';
import Root from '../Root';
import Layout from '../Layout';
import { makeDashboardLoader } from '../../dashboard';
import { makeSearchLoader } from '../../search';
import { makeProgramProgressLoader } from '../../program-progress';
import { makeEnterpriseInviteLoader } from './EnterpriseInviteRoute';
import { CoursePage, makeCourseLoader } from '../../course';
import { makeExternalCourseEnrollmentLoader } from '../../course/routes/ExternalCourseEnrollment';
import { makeProgramLoader } from '../../program';
import { makeAcademiesLoader } from '../../academies';
import { makePathwayProgressLoader } from '../../pathway-progress';
import { makeVideosLoader } from '../../microlearning';
import { flattenRoutePaths, getRouteLoader, replaceRouteParamsInPath } from '../../../routes';

jest.mock('./loaders', () => ({
  ...jest.requireActual('./loaders'),
  makeRootLoader: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  ...jest.requireActual('@edx/frontend-platform/react'),
  PageWrap: jest.fn(({ children }) => children),
}));
jest.mock('../Root', () => jest.fn());
jest.mock('../Layout', () => jest.fn());
jest.mock('../../dashboard', () => ({
  ...jest.requireActual('../../dashboard'),
  DashboardPage: jest.fn(() => <div data-testid="dashboard" />),
  makeDashboardLoader: jest.fn(),
}));
jest.mock('../../academies', () => ({
  ...jest.requireActual('../../academies'),
  AcademyPage: jest.fn(() => <div data-testid="academies" />),
  makeAcademiesLoader: jest.fn(),
}));
jest.mock('../../search', () => ({
  ...jest.requireActual('../../search'),
  SearchPage: jest.fn(() => <div data-testid="search" />),
  makeSearchLoader: jest.fn(),
}));
jest.mock('../../course', () => ({
  ...jest.requireActual('../../course'),
  CoursePage: jest.fn(),
  makeCourseLoader: jest.fn(),
}));
jest.mock('../../course/routes/CourseAbout', () => jest.fn().mockReturnValue(<div data-testid="course-about" />));
jest.mock('../../course/routes/ExternalCourseEnrollment', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="external-course-enrollment" />),
  makeExternalCourseEnrollmentLoader: jest.fn(),
}));
jest.mock('../../course/routes/ExternalCourseEnrollmentConfirmation', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="external-course-enrollment-confirmation" />),
}));
jest.mock('../../pathway-progress', () => ({
  ...jest.requireActual('../../pathway-progress'),
  PathwayProgressPage: jest.fn(() => <div data-testid="pathway-progress" />),
  makePathwayProgressLoader: jest.fn(),
}));
jest.mock('../../program', () => ({
  ...jest.requireActual('../../program'),
  ProgramPage: jest.fn(() => <div data-testid="program" />),
  makeProgramLoader: jest.fn(),
}));
jest.mock('../../program-progress', () => ({
  ...jest.requireActual('../../program-progress'),
  ProgramProgressPage: jest.fn(() => <div data-testid="program-progress" />),
  makeProgramProgressLoader: jest.fn(),
}));
jest.mock('../../skills-quiz', () => ({
  ...jest.requireActual('../../skills-quiz'),
  SkillsQuizPage: jest.fn(() => <div data-testid="skills-quiz" />),
}));
jest.mock('../../microlearning', () => ({
  ...jest.requireActual('../../microlearning'),
  VideoDetailPage: jest.fn(() => <div data-testid="microlearning" />),
  makeVideosLoader: jest.fn(),
}));
jest.mock('./EnterpriseInviteRoute', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="invite" />),
  makeEnterpriseInviteLoader: jest.fn(),
}));
jest.mock('./LicenseActivationRoute', () => jest.fn(() => <div data-testid="license-activation" />));
jest.mock('../../NotFoundPage', () => jest.fn(() => <div data-testid="not-found" />));

Root.mockImplementation(() => (
  <div data-testid="root">
    <Outlet />
  </div>
));
Layout.mockImplementation(() => (
  <div data-testid="layout">
    <Outlet />
  </div>
));
CoursePage.mockImplementation(() => (
  <div data-testid="course">
    <Outlet />
  </div>
));

const mockQueryClient = queryClient();

describe('createAppRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset history state before each test
    window.history.pushState({}, '', '/');
  });

  it.each([
    {
      currentRoutePath: '/fake/page/does/not/exist',
      expectedRouteTestId: 'not-found',
      expectedRouteLoaders: [],
    },
    {
      currentRoutePath: '/invite/enterprise-customer-invite-key',
      expectedRouteTestId: 'invite',
      expectedRouteLoaders: [{
        loader: makeEnterpriseInviteLoader,
        usesQueryClient: false,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/invite/enterprise-customer-invite-key',
      expectedRouteTestId: 'invite',
      expectedRouteLoaders: [{
        loader: makeEnterpriseInviteLoader,
        usesQueryClient: false,
      }],
    },
    {
      currentRoutePath: '/test-enterprise',
      expectedRouteTestId: 'dashboard',
      expectedRouteLoaders: [{
        loader: makeDashboardLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/pathway/test-pathway-uuid/progress',
      expectedRouteTestId: 'pathway-progress',
      expectedRouteLoaders: [{
        loader: makePathwayProgressLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/program/test-program-progress-uuid',
      expectedRouteTestId: 'program',
      expectedRouteLoaders: [{
        loader: makeProgramLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/program/test-program-progress-uuid/progress',
      expectedRouteTestId: 'program-progress',
      expectedRouteLoaders: [{
        loader: makeProgramProgressLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/search',
      expectedRouteTestId: 'search',
      expectedRouteLoaders: [{
        loader: makeSearchLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/academies/test-academy-uuid',
      expectedRouteTestId: 'academies',
      expectedRouteLoaders: [{
        loader: makeAcademiesLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/course/edX+DemoX',
      expectedRouteTestId: 'course',
      expectedRouteLoaders: [{
        loader: makeCourseLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/executive-education-2u/course/edX+DemoX',
      expectedRouteTestId: 'course',
      expectedRouteLoaders: [{
        loader: makeCourseLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/executive-education-2u/course/edX+DemoX/enroll/course-v1:edX+DemoX+T2024',
      expectedRouteTestId: 'external-course-enrollment',
      expectedRouteLoaders: [{
        loader: makeCourseLoader,
        usesQueryClient: true,
      }, {
        loader: makeExternalCourseEnrollmentLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/executive-education-2u/course/edX+DemoX/enroll/course-v1:edX+DemoX+T2024/complete',
      expectedRouteTestId: 'external-course-enrollment-confirmation',
      expectedRouteLoaders: [{
        loader: makeCourseLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/licenses/license-activation-key/activate',
      expectedRouteTestId: 'license-activation',
      expectedRouteLoaders: [],
    },
    {
      currentRoutePath: '/test-enterprise/skills-quiz',
      expectedRouteTestId: 'skills-quiz',
      expectedRouteLoaders: [],
    },
    {
      currentRoutePath: '/test-enterprise/videos/video-uuid',
      expectedRouteTestId: 'microlearning',
      expectedRouteLoaders: [{
        loader: makeVideosLoader,
        usesQueryClient: true,
      }],
    },
  ])('renders expected route components for given route path (%s)', async ({
    currentRoutePath,
    expectedRouteTestId,
    expectedRouteLoaders,
  }) => {
    // Update the current route path
    window.history.pushState({}, '', currentRoutePath);

    // Render the app router
    const router = createAppRouter(mockQueryClient);
    render(
      <IntlProvider locale="en">
        <RouterProvider router={router} />
      </IntlProvider>,
    );

    await waitFor(() => {
      expect(makeRootLoader).toHaveBeenCalledTimes(1);
      expect(makeRootLoader).toHaveBeenCalledWith(mockQueryClient);
      expect(screen.getByTestId('root')).toBeInTheDocument();
      expect(screen.getByTestId(expectedRouteTestId)).toBeInTheDocument();
      if (expectedRouteTestId !== 'invite') {
        // The invite routes are not associated with the `rootLoader` and `Layout` route
        expect(screen.getByTestId('layout')).toBeInTheDocument();
      }
    });

    if (expectedRouteLoaders.length > 0) {
      expectedRouteLoaders.forEach((expectedLoader) => {
        expect(expectedLoader.loader).toHaveBeenCalledTimes(1);
        if (expectedLoader.usesQueryClient) {
          expect(expectedLoader.loader).toHaveBeenCalledWith(mockQueryClient);
        }
      });
    }
  });

  it('renders and revalidates rootLoader appropriately when navigating sub-routes (%s)', async () => {
    // Create custom mocks
    const rootLoaderFn = jest.fn().mockReturnValue(null);
    makeRootLoader.mockReturnValue(rootLoaderFn);

    // Render the app router
    const router = createAppRouter(mockQueryClient);
    render(
      <IntlProvider locale="en">
        <RouterProvider router={router} />
      </IntlProvider>,
    );

    // Assert initial load
    await waitFor(() => {
      expect(makeRootLoader).toHaveBeenCalledTimes(1);
      expect(makeRootLoader).toHaveBeenCalledWith(mockQueryClient);
      expect(rootLoaderFn).toHaveBeenCalledTimes(1);
    });

    // Trigger navigation to the next route
    act(() => {
      router.navigate('/test-enterprise/search');
    });

    // Assert revalidation behavior
    await waitFor(() => {
      expect(rootLoaderFn).toHaveBeenCalledTimes(2); // Called again
    });
  });
});

describe('getRouteLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it.each([
    { hasQueryClient: true },
    { hasQueryClient: false },
  ])('calls and returns the expected loader', ({
    hasQueryClient,
  }) => {
    const mockResult = { success: true };
    const mockMakeRouteLoader = jest.fn().mockReturnValue(mockResult);
    const loader = getRouteLoader(mockMakeRouteLoader, hasQueryClient ? mockQueryClient : undefined);
    if (hasQueryClient) {
      expect(mockMakeRouteLoader).toHaveBeenCalledTimes(1);
      expect(mockMakeRouteLoader).toHaveBeenCalledWith(mockQueryClient);
      expect(loader).toEqual(mockResult);
    } else {
      expect(mockMakeRouteLoader).not.toHaveBeenCalled();
      expect(loader).toBeUndefined();
    }
  });
});

describe('flattenRoutePaths', () => {
  it('transforms route data structure into flattened array of route paths', () => {
    const routes = [
      {
        path: ':enterpriseSlug?',
        element: <Outlet />, // Outlet renders child route(s)
        loader: [() => {}],
        children: [
          {
            index: true,
            element: <div data-testid="dashboard" />,
          },
          {
            path: 'search',
            element: <div data-testid="search" />,
          },
          {
            path: ':courseType?/course/:courseKey',
            element: <Outlet />,
            children: [
              {
                index: true,
                element: <div data-testid="course-about" />,
              },
              {
                path: 'enroll/:courseRunKey',
                element: <div data-testid="course-enroll" />,
              },
            ],
          },
        ],
      },
    ];
    const routePaths = flattenRoutePaths(routes);
    expect(routePaths).toEqual([
      '/:enterpriseSlug?',
      '/:enterpriseSlug?/search',
      '/:enterpriseSlug?/:courseType?/course/:courseKey',
      '/:enterpriseSlug?/:courseType?/course/:courseKey/enroll/:courseRunKey',
    ]);
  });
});

describe('replaceRouteParamsInPath', () => {
  it.each([
    {
      currentViewPath: '/test-enterprise',
      expectedViewPath: '/?',
    },
    {
      currentViewPath: '/test-enterprise/executive-education-2u/course/edX+DemoX/enroll/course-v1:edX+DemoX+T2024',
      expectedViewPath: '/?/?/course/?/enroll/?',
    },
    {
      currentViewPath: '/test-enterprise/course/edX+DemoX',
      expectedViewPath: '/?/course/?',
    },
  ])('replaces matching route params with masked value (%s)', ({
    currentViewPath,
    expectedViewPath,
  }) => {
    const routePaths = [
      '/:enterpriseSlug?',
      '/:enterpriseSlug?/search',
      '/:enterpriseSlug?/:courseType?/course/:courseKey',
      '/:enterpriseSlug?/:courseType?/course/:courseKey/enroll/:courseRunKey',
      '/:enterpriseSlug?/*',
      '/*',
    ];
    const updatedPath = replaceRouteParamsInPath(currentViewPath, routePaths);
    expect(updatedPath).toEqual(expectedViewPath);
  });
});
