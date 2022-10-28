import React from 'react';
import { Route } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import EnterprisePageRedirect from '../EnterprisePageRedirect';

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
const EnterprisePageRedirectWithContext = ({
  initialAppState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <EnterprisePageRedirect />
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<EnterprisePageRedirect />', () => {
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
      <EnterprisePageRedirectWithContext initialAppState={initialAppState} />,
    );

    await waitFor(() => expect(fetchEnterpriseCustomerByUUID).toHaveBeenCalledTimes(0));

    // assert 404 page not found is shown
    expect(screen.getByText('404'));
  });

  test('redirects to correct ``redirectPath`` from route params when user is linked to an individual Enterprise Customer', async () => {
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

    const Component = (
      <Route path="/r/:redirectPath+">
        <EnterprisePageRedirectWithContext initialAppState={initialState} />;
      </Route>
    );
    const { history } = renderWithRouter(Component, { route: '/r/search' });

    await waitFor(() => expect(fetchEnterpriseCustomerByUUID).toHaveBeenCalledTimes(1));

    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISES[0].slug}/search`);
  });

  test('redirects to correct ``redirectPath`` from route params when user is linked to more than 1 Enterprise Customer', async () => {
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

    const Component = (
      <Route path="/r/:redirectPath+">
        <EnterprisePageRedirectWithContext initialAppState={initialState} />
      </Route>
    );
    const { history } = renderWithRouter(Component, { route: '/r/course/edX+DemoX' });

    await waitFor(() => expect(fetchEnterpriseCustomerByUUID).toHaveBeenCalledTimes(1));

    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISES[1].slug}/course/edX+DemoX`);
  });
});
