/* eslint-disable react/prop-types */
import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ExecutiveEducation2UPage from './ExecutiveEducation2UPage';
import { getExecutiveEducation2UTerms, GEAG_TERMS } from './data';

jest.mock('./data');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const initialAppContextValue = {
  enterpriseConfig: {
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
    jest.clearAllMocks();
  });

  it('shows 404 when `enableExecutiveEducation2UFulfillment` is false', () => {
    const appContextValue = {
      ...initialAppContextValue,
      enterpriseConfig: {
        ...initialAppContextValue.enterpriseConfig,
        enableExecutiveEducation2UFulfillment: false,
      },
    };
    render(<ExecutiveEducation2UPageWrapper appContextValue={appContextValue} />);
    expect(screen.getByText('404')).toBeInTheDocument();

    expect(getExecutiveEducation2UTerms).not.toHaveBeenCalled();
  });

  it('renders page when `enableExecutiveEducation2UFulfillment` is true', async () => {
    // mock service call
    getExecutiveEducation2UTerms.mockResolvedValueOnce({
      data: GEAG_TERMS,
    });

    render(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();

    // initially in loading state
    expect(screen.getByTestId('loading-skeleton-geag-terms')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Student Terms and Conditions')).toBeInTheDocument();
      expect(screen.getByText('Website Terms of Use')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
    });

    // no longer in loading state
    expect(screen.queryByTestId('loading-skeleton-geag-terms')).not.toBeInTheDocument();
  });

  it('handles exception when fetching GEAG terms', async () => {
    // mock service call
    getExecutiveEducation2UTerms.mockRejectedValueOnce(new Error('oh noes'));

    render(<ExecutiveEducation2UPageWrapper />);
    expect(screen.queryByText('404')).not.toBeInTheDocument();

    // initially in loading state
    expect(screen.getByTestId('loading-skeleton-geag-terms')).toBeInTheDocument();

    await waitFor(() => {
      expect(logError).toHaveBeenCalled();
    });
  });
});
