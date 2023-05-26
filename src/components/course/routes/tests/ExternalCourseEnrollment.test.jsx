import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { AppContext } from '@edx/frontend-platform/react';

import ExternalCourseEnrollment from '../ExternalCourseEnrollment';
import { CourseContext } from '../../CourseContextProvider';

jest.mock('../../data/hooks', () => ({
  ...jest.requireActual('../../data/hooks'),
  useMinimalCourseMetadata: () => ({
    organizationImage: 'https://test.org/logo.png',
    organizationName: 'Test Org',
    title: 'Test Course Title',
    startDate: '2023-03-05',
    duration: '3 Weeks',
    priceDetails: {
      price: 100,
      currency: 'USD',
    },
  }),
}));

jest.mock('../../../executive-education-2u/UserEnrollmentForm', () => jest.fn(() => (
  <div data-testid="user-enrollment-form" />
)));

const baseCourseContextValue = {
  state: {
    courseEntitlementProductSku: 'test-sku',
    activeCourseRun: {
      weeksToComplete: 8,
    },
    course: {
      organizationShortCodeOverride: 'Test Org',
      organizationLogoOverrideUrl: 'https://test.org/logo.png',
    },
  },
};

const baseAppContextValue = {
  enterpriseConfig: {
    uuid: 'test-uuid',
    enableDataSharingConsent: true,
  },
  authenticatedUser: { id: 3 },
};

const ExternalCourseEnrollmentWrapper = ({
  courseContextValue = baseCourseContextValue,
  appContextValue = baseAppContextValue,
}) => (
  <AppContext.Provider value={appContextValue}>
    <CourseContext.Provider value={courseContextValue}>
      <ExternalCourseEnrollment />
    </CourseContext.Provider>
  </AppContext.Provider>
);

describe('ExternalCourseEnrollment', () => {
  it('renders', () => {
    renderWithRouter(<ExternalCourseEnrollmentWrapper />);
    expect(screen.getByText('Your registration(s)')).toBeInTheDocument();
    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
    expect(screen.getByText('Available start date:')).toBeInTheDocument();
    expect(screen.getByText('Course duration:')).toBeInTheDocument();
    expect(screen.getByText('Course total:')).toBeInTheDocument();
    expect(screen.getAllByText('$100.00 USD')).toHaveLength(2);
    expect(screen.getByText('Registration summary:')).toBeInTheDocument();
    expect(screen.getByText('Registration total:')).toBeInTheDocument();
    expect(screen.getByTestId('user-enrollment-form')).toBeInTheDocument();
  });
});
