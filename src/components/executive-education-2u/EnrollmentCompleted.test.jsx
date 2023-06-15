import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import EnrollmentCompleted from './EnrollmentCompleted';
import { CURRENCY_USD } from '../course/data/constants';

const enterpriseSlug = 'test-enterprise-slug';
const initialAppContextValue = {
  enterpriseConfig: {
    name: 'Test Enterprise',
    slug: enterpriseSlug,
    authOrgId: enterpriseSlug,
  },
};
const mockBaseLocationMetadata = {
  state: {
    data: {
      organization: {
        logoImgUrl: 'test-image',
        name: 'test org',
        marketingUrl: 'test-url',
      },
      title: 'test-title',
      startDate: '2022-09-09',
      duration: '8',
      priceDetails: {
        price: 90,
        currency: CURRENCY_USD,
      },
    },
  },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => mockBaseLocationMetadata),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => ({
    GETSMARTER_STUDENT_TC_URL: 'https://example.url',
    GETSMARTER_LEARNER_DASHBOARD_URL: 'https://getsmarter.example.com/account',
  })),
}));

const EnrollmentCompletedWrapper = ({
  appContextValue = initialAppContextValue,
}) => (
  <AppContext.Provider value={appContextValue}>
    <EnrollmentCompleted />
  </AppContext.Provider>
);

// Note: these tests are not exhaustive, and continued work to improve these tests
// is being deferred as these components are being deprecated in favor of having these
// components rendered as nested routes under `CoursePage`.
describe('EnrollmentCompleted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders enrollment completed page with the metadata', () => {
    renderWithRouter(<EnrollmentCompletedWrapper />);
    expect(screen.getByText('What happens next?')).toBeInTheDocument();
    expect(screen.getByText('test org')).toBeInTheDocument();
    expect(screen.getByText(8)).toBeInTheDocument();
    expect(screen.getByText('Start date:')).toBeInTheDocument();
  });
  it('renders get smarter learner dashboard URL on enrollment.', () => {
    renderWithRouter(<EnrollmentCompletedWrapper />);
    expect(
      screen.getByRole('link', { name: 'GetSmarter learner dashboard' }),
    ).toHaveAttribute('href', 'https://getsmarter.example.com/account?org_id=test-enterprise-slug');
  });
});
