import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import ExecutiveEducation2UPage from './ExecutiveEducation2UPage';
import {
  useActiveQueryParams,
  useExecutiveEducation2UContentMetadata,
} from './data';

const mockReceiptPageUrl = 'https://edx.org';

jest.mock('./data');
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));
const MockUserEnrollmentForm = ({ productSKU, onCheckoutSuccess }) => (
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
jest.mock('./UserEnrollmentForm', () => <MockUserEnrollmentForm />);
const locationAssignMock = jest.fn();

const enterpriseSlug = 'test-enterprise-slug';
const initialAppContextValue = {
  enterpriseConfig: {
    name: 'Test Enterprise',
    slug: enterpriseSlug,
    enableExecutiveEducation2UFulfillment: true,
  },
};

const ExecutiveEducation2UPageWrapper = ({
  appContextValue = initialAppContextValue,
}) => (
  <AppContext.Provider value={appContextValue}>
    <ExecutiveEducation2UPage />
  </AppContext.Provider>
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
    const courseTitle = 'edX Demonstration Course';
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: { title: courseTitle },
    });
    const searchParams = new URLSearchParams();
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).toBeInTheDocument();
  });

  it('renders page when `enableExecutiveEducation2UFulfillment` is true and required query params are provided', () => {
    const courseTitle = 'edX Demonstration Course';
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: { title: courseTitle },
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

  it('renders page with loading states when fetching content metadata', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: true,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({ course_uuid: 'test-course-uuid', sku: 'ABC123' });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();

    expect(screen.getByTestId('loading-skeleton-page-title')).toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton-text-blurb')).toBeInTheDocument();
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
    expect(screen.getByText('Return to your learning platform')).toBeInTheDocument();
    expect(screen.getByText('No offer is available to cover this course.')).toBeInTheDocument();
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
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.queryByText('Return to your learning platform')).not.toBeInTheDocument();
    expect(screen.getByText('Your organization doesn’t have sufficient balance to cover this course.')).toBeInTheDocument();
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
    expect(screen.queryByText('Return to your learning platform')).not.toBeInTheDocument();
    expect(screen.getByText('An error has occured.')).toBeInTheDocument();
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

    expect(locationAssignMock).toHaveBeenCalledTimes(1);
    expect(locationAssignMock).toHaveBeenCalledWith(mockReceiptPageUrl);
  });
});
