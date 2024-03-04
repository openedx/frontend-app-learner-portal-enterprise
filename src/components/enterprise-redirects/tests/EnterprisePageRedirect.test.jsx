import React from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import EnterprisePageRedirect from '../EnterprisePageRedirect';

import { fetchEnterpriseCustomerByUUID } from '../data/service';

import { renderWithRouter } from '../../../utils/tests';

jest.mock('../data/service');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

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

const EnterprisePageRedirectWithContext = ({
  initialAppState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <EnterprisePageRedirect />
  </AppContext.Provider>
);

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
    useParams.mockReturnValue({
      '*': '',
    });

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

    useParams.mockReturnValue({
      '*': 'search',
    });

    const Component = (<EnterprisePageRedirectWithContext initialAppState={initialState} />);
    renderWithRouter(Component);

    await waitFor(() => expect(fetchEnterpriseCustomerByUUID).toHaveBeenCalledTimes(1));

    expect(window.location.pathname).toEqual(`/${TEST_ENTERPRISES[0].slug}/search`);
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

    useParams.mockReturnValue({
      '*': 'course/edX+DemoX',
    });

    const Component = (<EnterprisePageRedirectWithContext initialAppState={initialState} />);
    renderWithRouter(Component);

    await waitFor(() => expect(fetchEnterpriseCustomerByUUID).toHaveBeenCalledTimes(1));

    expect(window.location.pathname).toEqual(`/${TEST_ENTERPRISES[1].slug}/course/edX+DemoX`);
  });
});
