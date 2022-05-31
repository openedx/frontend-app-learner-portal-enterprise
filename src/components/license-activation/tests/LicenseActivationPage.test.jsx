/* eslint-disable react/prop-types */
import React from 'react';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import { Route } from 'react-router-dom';

import { renderWithRouter } from '../../../utils/tests';
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
      <Route exact path="/:enterpriseSlug/licenses/:activationKey/activate">
        <LicenseActivationPage />
      </Route>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<LicenseActivationPageWithAppContext />', () => {
  it.each(
    [undefined, { status: LICENSE_STATUS.ACTIVATED }],
  )('should redirect if the user has no license to activate', (subscriptionLicense) => {
    const { history } = renderWithRouter(
      <LicenseActivationPageWithContext
        initialUserSubsidyState={{
          subscriptionLicense,
        }}
      />,
      {
        route: TEST_ROUTE,
      },
    );

    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}`);
  });

  it('should render error alert if attempting to activate a license that does not belong to the user', () => {
    renderWithRouter(
      <LicenseActivationPageWithContext initialUserSubsidyState={{
        subscriptionLicense: {
          activationKey: '00000000-0000-0000-0000-000000000001',
          status: LICENSE_STATUS.ASSIGNED,
        },
      }}
      />,
      {
        route: TEST_ROUTE,
      },
    );

    expect(screen.getByText('<LicenseActivationErrorAlert />')).toBeInTheDocument();
  });

  it('should render <LicenseActivation /> if there is a license to activate', () => {
    renderWithRouter(
      <LicenseActivationPageWithContext initialUserSubsidyState={{
        subscriptionLicense: {
          activationKey: TEST_ACTIVATION_KEY,
          status: LICENSE_STATUS.ASSIGNED,
        },
      }}
      />,
      {
        route: TEST_ROUTE,
      },
    );
    expect(screen.getByText('<LicenseActivation />')).toBeInTheDocument();
  });
});
