import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { breakpoints, ResponsiveContext } from '@openedx/paragon';

import { AppContext } from '@edx/frontend-platform/react';
import CourseAbout from '../CourseAbout';
import { CourseContext } from '../../CourseContextProvider';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
import { renderWithRouter } from '../../../../utils/tests';

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

const baseCourseContextValue = {
  canOnlyViewHighlightSets: false,
  state: {
    courseEntitlementProductSku: 'test-sku',
    course: {
      key: 'demo-course',
      organizationShortCodeOverride: 'Test Org',
      organizationLogoOverrideUrl: 'https://test.org/logo.png',
    },
  },
};

const appContextValues = {
  enterpriseConfig: {
    disableSearch: false,
  },
};

const initialUserSubsidyState = {
  redeemableLearnerCreditPolicies: {
    redeemablePolicies: [],
    learnerContentAssignments: {
      assignments: [],
      hasAssignments: false,
      activeAssignments: [],
      hasActiveAssignments: false,
    },
  },
  enterpriseOffers: [],
  subscriptionPlan: {},
  subscriptionLicense: {},
  couponCodes: {
    couponCodes: [],
  },
};

const CourseAboutWrapper = ({
  responsiveContextValue = { width: breakpoints.extraLarge.minWidth },
  courseContextValue = baseCourseContextValue,
  initialAppState = appContextValues,

}) => (
  <ResponsiveContext.Provider value={responsiveContextValue}>
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <CourseContext.Provider value={courseContextValue}>
          <CourseAbout />
        </CourseContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </ResponsiveContext.Provider>
);

describe('CourseAbout', () => {
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
    const courseContextValue = {
      canOnlyViewHighlightSets: true,
      state: {
        courseEntitlementProductSku: 'test-sku',
        course: {
          key: 'demo-course',
          organizationShortCodeOverride: 'Test Org',
          organizationLogoOverrideUrl: 'https://test.org/logo.png',
        },
      },
    };
    renderWithRouter(<CourseAboutWrapper courseContextValue={courseContextValue} />);
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
