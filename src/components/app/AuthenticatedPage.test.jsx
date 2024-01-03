import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { useLocation, useParams, useRouteMatch } from 'react-router-dom';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import '@testing-library/jest-dom/extend-expect';

import AuthenticatedPage from './AuthenticatedPage';
import { useRecommendCoursesForMe } from './data';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useParams: jest.fn(),
  useRouteMatch: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-logistration', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-logistration'),
  LoginRedirect: jest.fn(({ children }) => children),
}));

jest.mock('./LoginRefresh', () => jest.fn(({ children }) => children));
jest.mock('../enterprise-page', () => ({
  ...jest.requireActual('../enterprise-page'),
  EnterprisePage: jest.fn(({ children }) => children),
}));
jest.mock('../layout', () => ({
  ...jest.requireActual('../layout'),
  Layout: jest.fn(({ children }) => children),
}));

jest.mock('./data', () => ({
  ...jest.requireActual('./data'),
  useRecommendCoursesForMe: jest.fn(),
}));

const mockEnterpriseSlug = 'test-enterprise-slug';
const mockEnterpriseName = 'Test Enterprise Name';
// Force the location/route to be the Search page in order to
// make assertions on the "Recommend courses for me" button in
// the renderWithRoutered ``EnterpriseBanner`` component.
const mockLocation = { pathname: `/${mockEnterpriseSlug}/search` };
const mockAuthenticatedUser = {
  id: 123,
  roles: [],
};

useLocation.mockReturnValue(mockLocation);
useParams.mockReturnValue({ enterpriseSlug: mockEnterpriseSlug });
useRouteMatch.mockReturnValue({ isExact: false });
useRecommendCoursesForMe.mockReturnValue({
  shouldRecommendCourses: false,
});

const defaultAppContextValue = {
  config: {},
  authenticatedUser: undefined,
  enterpriseConfig: undefined,
};

const AuthenticatedPageWrapper = ({
  children,
  appContextValue = defaultAppContextValue,
}) => (
  <AppContext.Provider value={appContextValue}>
    <AuthenticatedPage>
      {children}
    </AuthenticatedPage>
  </AppContext.Provider>
);

describe('AuthenticatedPage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('page shows logout component when logout mode is detected and user is logged off', () => {
    useLocation.mockReturnValue({ ...mockLocation, search: '?logout=true' });

    renderWithRouter(
      <AuthenticatedPageWrapper>
        <div data-testid="hidden-children" />
      </AuthenticatedPageWrapper>,
    );
    expect(screen.getByText('You are now logged out.')).toBeInTheDocument();
    expect(screen.queryByTestId('hidden-children')).not.toBeInTheDocument();
  });

  test.each([
    {
      shouldRecommendCourses: false,
    },
    {
      shouldRecommendCourses: true,
    },
  ])('handles authenticated user (%s)', ({ shouldRecommendCourses }) => {
    useRecommendCoursesForMe.mockReturnValue({
      shouldRecommendCourses,
    });

    const mockAppContextValueWithEnterpriseLearner = {
      ...defaultAppContextValue,
      authenticatedUser: mockAuthenticatedUser,
      enterpriseConfig: {
        slug: mockEnterpriseSlug,
        name: mockEnterpriseName,
      },
    };
    renderWithRouter(
      <AuthenticatedPageWrapper appContextValue={mockAppContextValueWithEnterpriseLearner}>
        <div data-testid="visible-children" />
      </AuthenticatedPageWrapper>,
    );
    expect(screen.getByTestId('visible-children')).toBeInTheDocument();
    expect(screen.getByText(mockEnterpriseName)).toBeInTheDocument();

    if (shouldRecommendCourses) {
      expect(screen.getByText('Recommend courses for me', { selector: 'a' })).toBeInTheDocument();
    } else {
      expect(screen.queryByText('Recommend courses for me', { selector: 'a' })).not.toBeInTheDocument();
    }
  });
});
