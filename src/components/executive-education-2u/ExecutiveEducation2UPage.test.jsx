/* eslint-disable react/prop-types */
import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import ExecutiveEducation2UPage from './ExecutiveEducation2UPage';
import { getContentMetadata, useActiveQueryParams } from './data';

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
    useActiveQueryParams.mockImplementation(() => new URLSearchParams());
    const appContextValue = {
      ...initialAppContextValue,
      enterpriseConfig: {
        ...initialAppContextValue.enterpriseConfig,
        enableExecutiveEducation2UFulfillment: false,
      },
    };
    renderWithRouter(<ExecutiveEducation2UPageWrapper appContextValue={appContextValue} />);
    expect(screen.getByText('404')).toBeInTheDocument();

    expect(getContentMetadata).not.toHaveBeenCalled();
  });

  it('does not render page when `enableExecutiveEducation2UFulfillment` is true and course_uuid is not provided', async () => {
    const courseTitle = 'edX Demonstration Course';
    getContentMetadata.mockResolvedValueOnce({ title: courseTitle });
    const searchParams = new URLSearchParams();
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).toBeInTheDocument();
  });

  it('renders page when `enableExecutiveEducation2UFulfillment` is true and course_uuid is provided', async () => {
    const courseTitle = 'edX Demonstration Course';
    getContentMetadata.mockResolvedValueOnce({ title: courseTitle });
    const searchParams = new URLSearchParams({ course_uuid: 'test-course-uuid' });
    useActiveQueryParams.mockImplementation(() => searchParams);

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();

    // initially in loading state
    expect(screen.getByTestId('loading-skeleton-page-title')).toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton-text-blurb')).toBeInTheDocument();

    // no longer in loading state
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton-page-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-skeleton-text-blurb')).not.toBeInTheDocument();
    });

    expect(screen.getByText(courseTitle, { exact: false })).toBeInTheDocument();
    expect(screen.getByTestId('user-enrollment-form-component')).toBeInTheDocument();
  });

  it('handles exception when fetching content metadata', async () => {
    const searchParams = new URLSearchParams({ course_uuid: 'test-course-uuid' });
    useActiveQueryParams.mockImplementation(() => searchParams);
    const mockError = new Error('oh noes');
    getContentMetadata.mockImplementation(() => new Promise(() => { throw mockError; }));

    renderWithRouter(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton-text-blurb')).toBeInTheDocument();

    await waitFor(() => {
      expect(logError).toHaveBeenCalledTimes(1);
      expect(logError).toHaveBeenCalledWith(mockError);
    });
  });
});
