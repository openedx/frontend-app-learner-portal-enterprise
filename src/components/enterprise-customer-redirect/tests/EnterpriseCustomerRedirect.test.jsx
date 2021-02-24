import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import EnterpriseCustomerRedirect from '../EnterpriseCustomerRedirect';

import { fetchEnterpriseCustomersForUser } from '../data/service';

import { renderWithRouter } from '../../../utils/tests';

jest.mock('../data/service');

const responseWithEmptyEnterpriseCustomers = {
  data: {
    results: [],
  },
};

const TEST_ENTERPRISES = [
  {
    uuid: 'some-fake-uuid',
    name: 'Test Enterprise',
    slug: 'test-enterprise',
  },
  {
    uuid: 'another-fake-uuid',
    name: 'Another Enterprise',
    slug: 'another-enterprise',
  },
];
const responseWithIndividualEnterpriseCustomer = {
  data: {
    results: [TEST_ENTERPRISES[0]],
  },
};
const responseWithSeveralEnterpriseCustomers = {
  data: {
    results: TEST_ENTERPRISES,
  },
};

/* eslint-disable react/prop-types */
const EnterpriseCustomerRedirectWithContext = ({
  initialAppState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <EnterpriseCustomerRedirect />
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<EnterpriseCustomerRedirect />', () => {
  const initialAppState = {
    authenticatedUser: {
      userId: 1,
      roles: [],
    },
    config: {
      LMS_BASE_URL: process.env.LMS_BASE_URL,
    },
  };

  beforeEach(() => {
    fetchEnterpriseCustomersForUser.mockClear();
  });

  test('renders NotFoundPage if user is not linked to any Enterprise Customers', async () => {
    fetchEnterpriseCustomersForUser.mockResolvedValue(responseWithEmptyEnterpriseCustomers);

    renderWithRouter(
      <EnterpriseCustomerRedirectWithContext initialAppState={initialAppState} />,
    );

    await waitFor(() => expect(fetchEnterpriseCustomersForUser).toHaveBeenCalledTimes(1));

    // assert 404 page not found is shown
    expect(screen.getByText('404'));
  });

  test('redirects to Enterprise Customer when user is linked to an individual Enterprise Customer', async () => {
    fetchEnterpriseCustomersForUser.mockResolvedValue(responseWithIndividualEnterpriseCustomer);

    const initialState = {
      ...initialAppState,
      authenticatedUser: {
        ...initialAppState.authenticatedUser,
        roles: [`enterprise_learner:${TEST_ENTERPRISES[0].uuid}`],
      },
    };

    const Component = <EnterpriseCustomerRedirectWithContext initialAppState={initialState} />;
    const { history } = renderWithRouter(Component, {
      route: '/',
    });

    await waitFor(() => expect(fetchEnterpriseCustomersForUser).toHaveBeenCalledTimes(1));

    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISES[0].slug}`);
  });

  test('redirects to Enterprise Customer when user is linked to 2+ Enterprise Customers', async () => {
    fetchEnterpriseCustomersForUser.mockResolvedValue(responseWithSeveralEnterpriseCustomers);

    const initialState = {
      ...initialAppState,
      authenticatedUser: {
        ...initialAppState.authenticatedUser,
        roles: [
          `enterprise_learner:${TEST_ENTERPRISES[1].uuid}`,
          `enterprise_learner:${TEST_ENTERPRISES[0].uuid}`,
        ],
      },
    };

    const Component = <EnterpriseCustomerRedirectWithContext initialAppState={initialState} />;
    const { history } = renderWithRouter(Component, {
      route: '/',
    });

    await waitFor(() => expect(fetchEnterpriseCustomersForUser).toHaveBeenCalledTimes(1));

    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISES[1].slug}`);
  });
});
