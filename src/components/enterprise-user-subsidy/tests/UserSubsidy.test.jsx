import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import UserSubsidy from '../UserSubsidy';

import { LICENSE_STATUS, LOADING_SCREEN_READER_TEXT } from '../data/constants';
import { fetchSubscriptionLicensesForUser } from '../data/service';

jest.mock('../data/service');

const TEST_SUBSCRIPTION_UUID = 'test-subscription-uuid';
const TEST_LICENSE_UUID = 'test-license-uuid';
const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';

function renderWithRouter(
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
) {
  // eslint-disable-next-line react/prop-types
  const Wrapper = ({ children }) => (
    <Router history={history}>{children}</Router>
  );
  return {
    ...render(ui, { wrapper: Wrapper }),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
}

// eslint-disable-next-line react/prop-types
const UserSubsidyWithAppContext = ({ contextValue = {} }) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG },
      ...contextValue,
    }}
  >
    <UserSubsidy>
      <span data-testid="did-i-render" />
    </UserSubsidy>
  </AppContext.Provider>
);

describe('with subscription plan', () => {
  const contextValue = {
    subscriptionPlan: { uuid: TEST_SUBSCRIPTION_UUID },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders children if user has an activated license from any route', async () => {
    const promise = Promise.resolve({
      data: {
        results: [{
          uuid: TEST_LICENSE_UUID,
          status: LICENSE_STATUS.ACTIVATED,
        }],
      },
    });
    fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

    const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
    renderWithRouter(Component, {
      route: `/${TEST_ENTERPRISE_SLUG}/search`,
    });

    // assert component is initially loading
    expect(screen.getByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

    expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledTimes(1);
    expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_SUBSCRIPTION_UUID);

    await waitFor(() => {
      expect(screen.getByTestId('did-i-render')).toBeInTheDocument();
    });

    // assert component is no longer loading
    expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
  });

  test('renders license activation alert if user has an assigned (pending) license on Dashboard page route', async () => {
    const promise = Promise.resolve({
      data: {
        results: [{
          uuid: TEST_LICENSE_UUID,
          status: LICENSE_STATUS.ASSIGNED,
        }],
      },
    });
    fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

    const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
    renderWithRouter(Component, {
      route: `/${TEST_ENTERPRISE_SLUG}`,
    });

    // assert status alert message renders
    await waitFor(() => {
      const activationMessage = 'activate your enterprise license';
      expect(screen.queryByRole('alert')).toBeInTheDocument();
      expect(screen.queryByText(activationMessage, { exact: false })).toBeInTheDocument();
    });
  });

  test('renders license deactivation alert if user has a deactivated (revoked) license on Dashboard page route', async () => {
    const promise = Promise.resolve({
      data: {
        results: [{
          uuid: TEST_LICENSE_UUID,
          status: LICENSE_STATUS.DEACTIVATED,
        }],
      },
    });
    fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

    const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
    renderWithRouter(Component, {
      route: `/${TEST_ENTERPRISE_SLUG}`,
    });

    // assert status alert message renders
    await waitFor(() => {
      const deactivationMessage = 'enterprise license is no longer active';
      expect(screen.queryByRole('alert')).toBeInTheDocument();
      expect(screen.queryByText(deactivationMessage, { exact: false })).toBeInTheDocument();
    });
  });

  test('redirects to Dashboard page if user has an assigned (pending) license on non-Dashboard page route', async () => {
    const promise = Promise.resolve({
      data: {
        results: [{
          uuid: TEST_LICENSE_UUID,
          status: LICENSE_STATUS.ASSIGNED,
        }],
      },
    });
    fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

    const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
    const { history } = renderWithRouter(Component, {
      route: `/${TEST_ENTERPRISE_SLUG}/search`,
    });

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}`);
    });
  });

  test('redirects to Dashboard page if user has a deactivated (revoked) license on non-Dashboard page route', async () => {
    const promise = Promise.resolve({
      data: {
        results: [{
          uuid: TEST_LICENSE_UUID,
          status: LICENSE_STATUS.DEACTIVATED,
        }],
      },
    });
    fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

    const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
    const { history } = renderWithRouter(Component, {
      route: `/${TEST_ENTERPRISE_SLUG}/search`,
    });

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}`);
    });
  });
});
