import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ExecutiveEducation2UPage from './ExecutiveEducation2UPage';
import {
  useActiveQueryParams,
  useExecutiveEducation2UContentMetadata,
} from './data';
import { CURRENCY_USD, PAID_EXECUTIVE_EDUCATION } from '../course/data/constants';

const mockReceiptPageUrl = 'https://edx.org';
const courseTitle = 'edX Demonstration Course';

const courseData = {
  key: 'test-course-key',
  title: courseTitle,
  shortDescription: 'A short description of the test course',
  fullDescription: 'A full description of the test course',
  image: {
    src: 'https://example.com/test-course-image.jpg',
  },
  start: '2022-01-01T00:00:00Z',
  end: '2022-12-31T23:59:59Z',
  courseRuns: [
    {
      uuid: 'course-run-1',
      key: 'test-course-run-key',
      title: 'Test Course Run',
      start: '2022-01-01T00:00:00Z',
      end: '2022-12-31T23:59:59Z',
      enrollmentStart: '2022-01-01T00:00:00Z',
      enrollmentEnd: '2022-12-31T23:59:59Z',
      seatTypes: [
        {
          type: 'verified',
          price: 199.99,
          currency: 'USD',
        },
      ],
      instructors: [
        {
          key: 'instructor-1',
          name: 'Instructor 1',
          bio: 'Instructor 1 bio',
          image: {
            src: 'https://example.com/instructor-1.jpg',
          },
        },
      ],
      pacingType: 'self_paced',
    },
  ],
  advertisedCourseRunUuid: 'test-course-run-key',
  owners: [],
  organizationShortCodeOverride: 'Test Organization',
  organizationLogoOverrideUrl: 'https://example.com/test.jpeg',
  entitlements: [
    {
      mode: PAID_EXECUTIVE_EDUCATION,
      price: '100.00',
      currency: CURRENCY_USD,
    },
  ],
  additionalMetadata: {
    startDate: '2022-01-01T00:00:00Z',
  },
};

jest.mock('./data');
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

const mockedPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => ({
    push: mockedPush,
  }),
  useLocation: jest.fn(),
}));

jest.mock('./UserEnrollmentForm', () => function MockUserEnrollmentForm({ productSKU, onCheckoutSuccess }) {
  return (
    <div data-testid="user-enrollment-form-component">
      <div>{productSKU}</div>
      <button
        type="button"
        onClick={() => {
          const sampleResponse = { receiptPageUrl: mockReceiptPageUrl };
          onCheckoutSuccess(sampleResponse);
        }}
      >
        Mock submit enrollment form
      </button>
    </div>
  );
});
const locationAssignMock = jest.fn();

const enterpriseSlug = 'test-enterprise-slug';
const initialAppContextValue = {
  enterpriseConfig: {
    name: 'Test Enterprise',
    slug: enterpriseSlug,
    enableExecutiveEducation2UFulfillment: true,
    enableDataSharingConsent: true,
    adminUsers: [],
  },
};

const ExecutiveEducation2UPageWrapper = ({
  appContextValue = initialAppContextValue,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appContextValue}>
      <ExecutiveEducation2UPage />
    </AppContext.Provider>
  </IntlProvider>
);

describe('ExecutiveEducation2UPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows 404 when `enableExecutiveEducation2UFulfillment` is false', () => {
    useActiveQueryParams.mockReturnValue(new URLSearchParams());
    useExecutiveEducation2UContentMetadata.mockReturnValue({ isLoading: false, contentMetadata: undefined });

    const appContextValue = {
      ...initialAppContextValue,
      enterpriseConfig: {
        ...initialAppContextValue.enterpriseConfig,
        enableExecutiveEducation2UFulfillment: false,
      },
    };
    renderWithRouter(<ExecutiveEducation2UPageWrapper appContextValue={appContextValue} />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('does not render page when `enableExecutiveEducation2UFulfillment` is true and required query params are not provided', async () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: courseData,
    });
    const searchParams = new URLSearchParams();
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).toBeInTheDocument();
  });

  it('renders page when `enableExecutiveEducation2UFulfillment` is true and required query params are provided', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: courseData,
    });
    const searchParams = new URLSearchParams({ course_uuid: 'test-course-uuid', sku: 'ABC123' });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();

    expect(screen.queryByTestId('loading-skeleton-page-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading-skeleton-text-blurb')).not.toBeInTheDocument();

    expect(screen.getByText(courseTitle, { exact: false })).toBeInTheDocument();
    expect(screen.getByTestId('user-enrollment-form-component')).toBeInTheDocument();
  });

  it('renders page with loading states when fetching content metadata', async () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoadingContentMetadata: true,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({ course_uuid: 'test-course-uuid', sku: 'ABC123' });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();

    expect(await screen.getByTestId('loading-skeleton-page-title')).toBeInTheDocument();
    expect(await screen.getByTestId('loading-skeleton-text-blurb')).toBeInTheDocument();
  });

  it('renders error page with failure_reason message and http_referrer when fetching content metadata fails', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({
      course_uuid: 'test-course-uuid',
      sku: 'ABC123',
      failure_reason: 'no_offer_available',
      http_referer: 'https://edx.org',
    });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.getByText('Helpful link:')).toBeInTheDocument();
    expect(screen.getByText('No learner credit is available to cover this course.')).toBeInTheDocument();
  });

  it('renders error page with valid failure_reason message', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({
      course_uuid: 'test-course-uuid',
      sku: 'ABC123',
      failure_reason: 'no_offer_with_enough_balance',
    });
    const failureReason = 'You don\'t have access to this course because your organization '
                          + 'doesn\'t have enough funds. Please contact your edX administrator '
                          + 'to resolve the error and provide you access to this content.';
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.getByText('Helpful link:')).toBeInTheDocument();
    expect(screen.getByText(failureReason)).toBeInTheDocument();
  });

  it('renders error page with valid user balance failure message', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({
      course_uuid: 'test-course-uuid',
      sku: 'ABC123',
      failure_reason: 'no_offer_with_enough_user_balance',
    });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.queryByText('Return to your learning platform')).not.toBeInTheDocument();
    expect(screen.getByText('Your enrollment was not completed! You have already spent your personal budget for enrollments.')).toBeInTheDocument();
  });

  it('renders error page with valid no remaining applications failure message', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({
      course_uuid: 'test-course-uuid',
      sku: 'ABC123',
      failure_reason: 'no_offer_with_remaining_applications',
    });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.queryByText('Return to your learning platform')).not.toBeInTheDocument();
    expect(screen.getByText('Your enrollment was not completed! You have reached your maximum number of allowed enrollments.')).toBeInTheDocument();
  });

  it('renders error page with invalid failure_reason', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({
      course_uuid: 'test-course-uuid',
      sku: 'ABC123',
      failure_reason: 'pikachu_i_choose_you',
    });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.queryByText('Return to dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('An error has occurred.')).toBeInTheDocument();
  });

  it('renders error page with system error and clicks on return button', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({
      course_uuid: 'test-course-uuid',
      sku: 'ABC123',
      failure_reason: 'system_error',
      http_referer: 'https://edx.org',
    });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.getByText('System Error has occurred.')).toBeInTheDocument();

    const returnButton = screen.getByText('Return to dashboard');
    expect(returnButton).toBeInTheDocument();
    userEvent.click(returnButton);
  });

  it('handles form submission success', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({
      course_uuid: 'test-course-uuid',
      sku: 'ABC123',
    });
    useActiveQueryParams.mockImplementation(() => searchParams);
    delete global.location;
    global.location = { assign: locationAssignMock };

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    userEvent.click(screen.getByText('Mock submit enrollment form'));

    expect(mockedPush).toHaveBeenCalledTimes(1);
    expect(mockedPush).toHaveBeenCalledWith(
      { pathname: `/${enterpriseSlug}/executive-education-2u/enrollment-completed`, state: { data: {} } },
    );
  });
});
