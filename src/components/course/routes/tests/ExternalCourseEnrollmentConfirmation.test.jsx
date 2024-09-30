import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import ExternalCourseEnrollmentConfirmation from '../ExternalCourseEnrollmentConfirmation';
import { DISABLED_ENROLL_REASON_TYPES } from '../../data/constants';
import { useExternalEnrollmentFailureReason, useMinimalCourseMetadata } from '../../data';
import { renderWithRouterProvider } from '../../../../utils/tests';
import { useEnterpriseCustomer } from '../../../app/data';
import { enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useExternalEnrollmentFailureReason: jest.fn(),
  useMinimalCourseMetadata: jest.fn(),
}));

const ExternalCourseEnrollmentConfirmationWrapper = () => (
  <IntlProvider locale="en">
    <ExternalCourseEnrollmentConfirmation />
  </IntlProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('ExternalCourseEnrollmentConfirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({
      GETSMARTER_STUDENT_TC_URL: 'https://example.com/terms',
    });
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useExternalEnrollmentFailureReason.mockReturnValue({
      failureReason: undefined,
      failureMessage: undefined,
    });
    useMinimalCourseMetadata.mockReturnValue({
      data: {
        title: 'Test Course Title',
        organization: {
          name: 'Test Org',
          marketingUrl: 'https://example.com',
          logoImgUrl: 'https://example.com/logo.png',
        },
        priceDetails: {
          price: [100],
          currency: 'USD',
        },
        startDate: '2023-03-05T12:00:00Z',
        duration: '3 Weeks',
      },
    });
  });

  it('renders', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <ExternalCourseEnrollmentConfirmationWrapper />,
    }, {
      initialEntries: ['/test-enterprise'],
    });
    expect(screen.getByText('Congratulations, you have completed your enrollment for your online course')).toBeInTheDocument();
    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();
    expect(screen.getByText('Start date:')).toBeInTheDocument();
    expect(screen.getByText('Mar 5, 2023')).toBeInTheDocument();
    expect(screen.getByText('Course duration:')).toBeInTheDocument();
    expect(screen.getByText('3 Weeks')).toBeInTheDocument();
    expect(screen.getByText('Course total:')).toBeInTheDocument();
    expect(screen.getByText('$100.00 USD')).toBeInTheDocument();
    expect(screen.getByText('$0.00 USD')).toBeInTheDocument();
    expect(screen.getByText('What happens next?')).toBeInTheDocument();
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
  });

  it('handles failure reason', () => {
    useExternalEnrollmentFailureReason.mockReturnValue({
      failureReason: DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS,
      failureMessage: 'No learner credit is available to cover this course.',
    });
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <ExternalCourseEnrollmentConfirmationWrapper />,
    }, {
      initialEntries: ['/test-enterprise'],
    });
    expect(screen.queryByText('Congratulations, you have completed your enrollment for your online course')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Course Title')).not.toBeInTheDocument();
    expect(screen.getByText("We're sorry.")).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText('No learner credit is available to cover this course.'));
  });
});
