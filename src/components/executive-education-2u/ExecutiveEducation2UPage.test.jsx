/* eslint-disable react/prop-types */
import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import ExecutiveEducation2UPage from './ExecutiveEducation2UPage';
import {
  useActiveQueryParams,
  useExecutiveEducation2UContentMetadata,
} from './data';

jest.mock('./data');
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));
jest.mock('./UserEnrollmentForm', () => () => (
  <div data-testid="user-enrollment-form-component" />
));
const enterpriseSlug = 'test-enterprise-slug';
const initialAppContextValue = {
  enterpriseConfig: {
    name: 'Test Enterprise',
    slug: enterpriseSlug,
    enableExecutiveEducation2UFulfillment: true,
  },
};

function ExecutiveEducation2UPageWrapper({
  appContextValue = initialAppContextValue,
}) {
  return (
    <AppContext.Provider value={appContextValue}>
      <ExecutiveEducation2UPage />
    </AppContext.Provider>
  );
}

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

  it('does not render page when `enableExecutiveEducation2UFulfillment` is true and course_uuid is not provided', async () => {
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

  it('renders page when `enableExecutiveEducation2UFulfillment` is true and course_uuid is provided', () => {
    const courseTitle = 'edX Demonstration Course';
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: { title: courseTitle },
    });
    const searchParams = new URLSearchParams({ course_uuid: 'test-course-uuid' });
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
    const searchParams = new URLSearchParams({ course_uuid: 'test-course-uuid' });
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
    const searchParams = new URLSearchParams({ course_uuid: 'test-course-uuid', failure_reason: 'no_offer_available', http_referrer: 'https://edx.org' });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.getByText('Return to your learning platform')).toBeInTheDocument();
    expect(screen.getByText('No offer is available to cover this course.')).toBeInTheDocument();
  });

  it('renders error page with failure_reason message when fetching content metadata fails', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({ course_uuid: 'test-course-uuid', failure_reason: 'no_offer_with_enough_balance' });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.queryByText('Return to your learning platform')).not.toBeInTheDocument();
    expect(screen.getByText('Your organization doesn’t have sufficient balance to cover this course.')).toBeInTheDocument();
  });

  it('renders error page with failure_reason message not predefined when fetching content metadata fails', () => {
    useExecutiveEducation2UContentMetadata.mockReturnValue({
      isLoading: false,
      contentMetadata: undefined,
    });
    const searchParams = new URLSearchParams({ course_uuid: 'test-course-uuid', failure_reason: 'pikachu_i_choose_you' });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.queryByText('Return to your learning platform')).not.toBeInTheDocument();
    expect(screen.getByText('An error has occured.')).toBeInTheDocument();
  });
});
