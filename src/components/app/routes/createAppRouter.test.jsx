import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import { Outlet, RouterProvider } from 'react-router-dom';
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

jest.mock('./loaders', () => ({
  ...jest.requireActual('./loaders'),
  makeRootLoader: jest.fn(),
  makeCourseLoader: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  ...jest.requireActual('@edx/frontend-platform/react'),
  PageWrap: jest.fn(({ children }) => children),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  configure: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  configure: jest.fn(),
  getLoggingService: jest.fn(),
}));
jest.mock('../Root', () => jest.fn());
jest.mock('../Layout', () => jest.fn());

jest.mock('../../dashboard', () => ({
  ...jest.requireActual('../../dashboard'),
  DashboardPage: jest.fn(() => <div data-testid="dashboard" />),
  makeDashboardLoader: jest.fn(),
}));
jest.mock('../../search', () => ({
  ...jest.requireActual('../../search'),
  SearchPage: jest.fn(() => <div data-testid="search" />),
  makeSearchLoader: jest.fn(),
}));
jest.mock('../../program-progress', () => ({
  ...jest.requireActual('../../program-progress'),
  ProgramProgressPage: jest.fn(() => <div data-testid="program-progress" />),
  makeProgramProgressLoader: jest.fn(),
}));
jest.mock('./EnterpriseInviteRoute', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="invite" />),
  makeEnterpriseInviteLoader: jest.fn(),
}));
jest.mock('./LicenseActivationRoute', () => jest.fn(() => <div data-testid="license-activation" />));
jest.mock('./CourseRoute', () => jest.fn(() => <div data-testid="course" />));
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
      currentRoutePath: '/test-enterprise',
      expectedRouteTestId: 'dashboard',
      expectedRouteLoaders: [{
        loader: makeDashboardLoader,
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
      currentRoutePath: '/test-enterprise/course/edX+DemoX',
      expectedRouteTestId: 'course',
      expectedRouteLoaders: [{
        loader: makeCourseLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/executive-education/course/edX+DemoX',
      expectedRouteTestId: 'course',
      expectedRouteLoaders: [{
        loader: makeCourseLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/executive-education/course/edX+DemoX/enroll',
      expectedRouteTestId: 'course',
      expectedRouteLoaders: [{
        loader: makeCourseLoader,
        usesQueryClient: true,
      }],
    },
    {
      currentRoutePath: '/test-enterprise/executive-education/course/edX+DemoX/enroll/complete',
      expectedRouteTestId: 'course',
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
  ])('renders expected route components for given route path (%s)', async ({
    currentRoutePath,
    expectedRouteTestId,
    expectedRouteLoaders,
  }) => {
    const router = createAppRouter(mockQueryClient);
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(makeRootLoader).toHaveBeenCalledTimes(1);
      expect(makeRootLoader).toHaveBeenCalledWith(mockQueryClient);
      expect(screen.getByTestId('root')).toBeInTheDocument();
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    act(() => {
      router.navigate(currentRoutePath);
    });

    await waitFor(() => {
      expect(screen.getByTestId(expectedRouteTestId)).toBeInTheDocument();
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
});
