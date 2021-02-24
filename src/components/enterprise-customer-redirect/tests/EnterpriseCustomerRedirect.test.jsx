import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import EnterpriseCustomerRedirect from '../EnterpriseCustomerRedirect';

import { fetchEnterpriseCustomerByUUID } from '../data/service';

import { renderWithRouter } from '../../../utils/tests';

jest.mock('../data/service');

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
    fetchEnterpriseCustomerByUUID.mockClear();
  });

  test('renders NotFoundPage if user is not linked to any Enterprise Customers', async () => {
    renderWithRouter(
      <EnterpriseCustomerRedirectWithContext initialAppState={initialAppState} />,
    );

    await waitFor(() => expect(fetchEnterpriseCustomerByUUID).toHaveBeenCalledTimes(0));

    // assert 404 page not found is shown
    expect(screen.getByText('404'));
  });

  test('redirects to Enterprise Customer when user is linked to an individual Enterprise Customer', async () => {
    const mockResponse = {
      data: {
        count: 1,
        results: [TEST_ENTERPRISES[0]],
      },
    };
    fetchEnterpriseCustomerByUUID.mockResolvedValue(mockResponse);

    const initialState = {
      ...initialAppState,
      authenticatedUser: {
        ...initialAppState.authenticatedUser,
        roles: [`enterprise_learner:${TEST_ENTERPRISES[0].uuid}`],
      },
    };

    const Component = <EnterpriseCustomerRedirectWithContext initialAppState={initialState} />;
    const { history } = renderWithRouter(Component, { route: '/' });

    await waitFor(() => expect(fetchEnterpriseCustomerByUUID).toHaveBeenCalledTimes(1));

    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISES[0].slug}`);
  });

  test('redirects to selected Enterprise Customer when user is linked to more than 1 Enterprise Customer', async () => {
    const mockResponse = {
      data: {
        count: 1,
        results: [TEST_ENTERPRISES[1]],
      },
    };
    fetchEnterpriseCustomerByUUID.mockResolvedValue(mockResponse);

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
    const { history } = renderWithRouter(Component, { route: '/' });

    await waitFor(() => expect(fetchEnterpriseCustomerByUUID).toHaveBeenCalledTimes(1));

    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISES[1].slug}`);
  });
});
