import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ExternalCourseEnrollmentConfirmation from '../ExternalCourseEnrollmentConfirmation';
import { CourseContext } from '../../CourseContextProvider';

jest.mock('../../data/hooks', () => ({
  ...jest.requireActual('../../data/hooks'),
  useMinimalCourseMetadata: () => ({
    organizationImage: 'https://test.org/logo.png',
    organizationName: 'Test Org',
    title: 'Test Course Title',
    startDate: 'March 5, 2023',
    duration: '3 Weeks',
    priceDetails: {
      price: 100,
      currency: 'USD',
    },
  }),
}));

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

const ExternalCourseEnrollmentConfirmationWrapper = ({
  courseContextValue = baseCourseContextValue,
}) => (
  <CourseContext.Provider value={courseContextValue}>
    <ExternalCourseEnrollmentConfirmation />
  </CourseContext.Provider>
);

describe('ExternalCourseEnrollment', () => {
  it('renders', () => {
    render(<ExternalCourseEnrollmentConfirmationWrapper />);
    expect(screen.getByText('Congratulations, you have completed your enrollment for your online course')).toBeInTheDocument();
    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();
    expect(screen.getByText('Start date:')).toBeInTheDocument();
    expect(screen.getByText('March 5, 2023')).toBeInTheDocument();
    expect(screen.getByText('Course duration:')).toBeInTheDocument();
    expect(screen.getByText('3 Weeks')).toBeInTheDocument();
    expect(screen.getByText('Course total:')).toBeInTheDocument();
    expect(screen.getByText('$100.00 USD')).toBeInTheDocument();
    expect(screen.getByText('What happens next?')).toBeInTheDocument();
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
    screen.debug();
  });
});
