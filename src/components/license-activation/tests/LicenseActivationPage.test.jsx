import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import {
  MemoryRouter, Route, Routes, mockNavigate,
} from 'react-router-dom';

import LicenseActivationPage from '../LicenseActivationPage';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';

const TEST_USER_ID = 1;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({})),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ userId: TEST_USER_ID }),
}));
jest.mock('../LicenseActivation', () => ({
  __esModule: true,
  default: () => '<LicenseActivation />',
}));
jest.mock('../LicenseActivationErrorAlert', () => ({
  __esModule: true,
  default: () => '<LicenseActivationErrorAlert />',
}));
jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';
const TEST_ACTIVATION_KEY = '00000000-0000-0000-0000-000000000000';
const TEST_ROUTE = `/${TEST_ENTERPRISE_SLUG}/licenses/${TEST_ACTIVATION_KEY}/activate`;

const LicenseActivationPageWithContext = ({
  initialUserSubsidyState = {
    subscriptionLicense: undefined,
    couponCodes: {
      couponCodes: [],
      couponCodesCount: 0,
    },
  },
}) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: {
        uuid: TEST_ENTERPRISE_UUID,
        slug: TEST_ENTERPRISE_SLUG,
        name: 'Test Enterprise',
      },
    }}
  >
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <Routes>
        <Route exact path="/:enterpriseSlug/licenses/:activationKey/activate" element={<LicenseActivationPage />} />
      </Routes>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<LicenseActivationPageWithAppContext />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(
    [undefined, { status: LICENSE_STATUS.ACTIVATED }],
  )('should redirect if the user has no license to activate', (subscriptionLicense) => {
    render(
      <MemoryRouter initialEntries={[TEST_ROUTE]}>
        <LicenseActivationPageWithContext initialUserSubsidyState={{
          subscriptionLicense,
        }}
        />
      </MemoryRouter>,
    );

    expect(mockNavigate).toHaveBeenCalledWith(`/${TEST_ENTERPRISE_SLUG}`);
  });

  it('should render error alert if attempting to activate a license that does not belong to the user', () => {
    render(
      <MemoryRouter initialEntries={[TEST_ROUTE]}>
        <LicenseActivationPageWithContext initialUserSubsidyState={{
          subscriptionLicense: {
            activationKey: '00000000-0000-0000-0000-000000000001',
            status: LICENSE_STATUS.ASSIGNED,
          },
        }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('<LicenseActivationErrorAlert />')).toBeInTheDocument();
  });

  it('should render <LicenseActivation /> if there is a license to activate', () => {
    render(
      <MemoryRouter initialEntries={[TEST_ROUTE]}>
        <LicenseActivationPageWithContext initialUserSubsidyState={{
          subscriptionLicense: {
            activationKey: TEST_ACTIVATION_KEY,
            status: LICENSE_STATUS.ASSIGNED,
          },
        }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('<LicenseActivation />')).toBeInTheDocument();
  });
});
