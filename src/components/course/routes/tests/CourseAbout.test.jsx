import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { breakpoints, ResponsiveContext } from '@openedx/paragon';

import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import CourseAbout from '../CourseAbout';
import { renderWithRouter } from '../../../../utils/tests';
import { useEnterpriseCustomer, useCanOnlyViewHighlights } from '../../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn().mockReturnValue(false),
  useCanOnlyViewHighlights: jest.fn().mockReturnValue(false),
}));

jest.mock('../../course-header/CourseHeader', () => jest.fn(() => (
  <div data-testid="course-header" />
)));

jest.mock('../../../layout', () => ({
  ...jest.requireActual('../../../layout'),
  MainContent: jest.fn(({ children }) => (
    <div data-testid="main-content">{children}</div>
  )),
  Sidebar: jest.fn(({ children }) => (
    <div data-testid="sidebar">{children}</div>
  )),
}));

jest.mock('../../CourseMainContent', () => jest.fn(() => (
  <div data-testid="course-main-content" />
)));

jest.mock('../../CourseSidebar', () => jest.fn(() => (
  <div data-testid="course-sidebar" />
)));

jest.mock('../../CourseRecommendations', () => jest.fn(() => (
  <div data-testid="course-recommendations" />
)));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const appContextValues = {
  authenticatedUser: mockAuthenticatedUser,
};

const CourseAboutWrapper = ({
  responsiveContextValue = { width: breakpoints.extraLarge.minWidth },
  initialAppState = appContextValues,
}) => (
  <IntlProvider locale="en">
    <ResponsiveContext.Provider value={responsiveContextValue}>
      <AppContext.Provider value={initialAppState}>
        <CourseAbout />
      </AppContext.Provider>
    </ResponsiveContext.Provider>
  </IntlProvider>
);

describe('CourseAbout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('renders', () => {
    renderWithRouter(<CourseAboutWrapper />);
    expect(screen.getByTestId('course-header')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('course-main-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('course-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('course-recommendations')).toBeInTheDocument();
  });

  it('renders with canOnlyViewHighlightSets=true', () => {
    useCanOnlyViewHighlights.mockReturnValue({ data: true });
    renderWithRouter(<CourseAboutWrapper />);
    expect(screen.getByTestId('course-header')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('course-main-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('course-sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('course-recommendations')).not.toBeInTheDocument();
  });

  it('renders without sidebar is screen is below breakpointslarge.minWidth', () => {
    renderWithRouter(<CourseAboutWrapper responsiveContextValue={{ width: breakpoints.small.minWidth }} />);
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('course-sidebar')).not.toBeInTheDocument();
  });
});
