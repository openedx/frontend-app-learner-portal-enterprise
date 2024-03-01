import { screen } from '@testing-library/react';
import { when } from 'jest-when';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../../../utils/tests';
import makeUpdateActiveEnterpriseCustomerUserLoader from '../updateActiveEnterpriseCustomerUserLoader';
import {
  ensureAuthenticatedUser,
  extractEnterpriseId,
  updateActiveEnterpriseCustomerUser,
  queryEnterpriseLearner,
} from '../../data';

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  ensureAuthenticatedUser: jest.fn(),
  extractEnterpriseId: jest.fn(),
  updateActiveEnterpriseCustomerUser: jest.fn(),
}));

const mockUsername = 'edx';
const mockUserEmail = 'edx@example.com';
const mockEnterpriseId = 'test-enterprise-uuid';
const mockEnterpriseSlug = 'test-enterprise-slug';
ensureAuthenticatedUser.mockResolvedValue({
  userId: 3,
  email: mockUserEmail,
  username: mockUsername,
});
extractEnterpriseId.mockResolvedValue(mockEnterpriseId);
updateActiveEnterpriseCustomerUser.mockResolvedValue({});

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
  setQueryData: jest.fn(),
};

describe('updateActiveEnterpriseCustomerUserLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ensures only the enterprise-learner query is called if there is no active enterprise customer user', async () => {
    const enterpriseLearnerQuery = queryEnterpriseLearner(mockUsername, mockEnterpriseSlug);
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
      }),
    ).mockResolvedValue({ activeEnterpriseCustomer: null });

    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeUpdateActiveEnterpriseCustomerUserLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseSlug}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    // Assert that the expected number of queries were made.
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
  });

  it('ensures only the enterprise-learner query is called when there active enterprise customer user matches the current enterprise slug', async () => {
    const enterpriseLearnerQuery = queryEnterpriseLearner(mockUsername, mockEnterpriseSlug);
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
      }),
    ).mockResolvedValue({
      activeEnterpriseCustomer: {
        slug: mockEnterpriseSlug,
      },
    });

    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeUpdateActiveEnterpriseCustomerUserLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseSlug}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    // Assert that the expected number of queries were made.
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
  });

  it('updates the active enterprise customer user when the enterprise slug does not match the active enterprise customer and the user is linked', async () => {
    const enterpriseLearnerQuery = queryEnterpriseLearner(mockUsername, mockEnterpriseSlug);
    const activeEnterpriseCustomer = {
      slug: 'other-enterprise-slug',
    };
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
      }),
    ).mockResolvedValue({
      activeEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        {
          enterpriseCustomer: activeEnterpriseCustomer,
        },
        {
          enterpriseCustomer: {
            slug: mockEnterpriseSlug,
          },
        },
      ],
    });

    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeUpdateActiveEnterpriseCustomerUserLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseSlug}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    // Assert that the expected number of queries were made.
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);

    // Assert that the active enterprise customer user was updated.
    expect(updateActiveEnterpriseCustomerUser).toHaveBeenCalledTimes(1);
  });

  it('updates the active enterprise customer user when the enterprise slug does not match the active enterprise customer and the user is NOT linked', async () => {
    const enterpriseLearnerQuery = queryEnterpriseLearner(mockUsername, mockEnterpriseSlug);
    const activeEnterpriseCustomer = {
      slug: 'other-enterprise-slug',
    };
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
      }),
    ).mockResolvedValue({
      activeEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        {
          enterpriseCustomer: activeEnterpriseCustomer,
        },
      ],
    });

    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeUpdateActiveEnterpriseCustomerUserLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseSlug}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    // Assert that the expected number of queries were made. The first call
    // is due to the initial render, and the second call is due to the
    // redirect to the slug of the active enterprise customer.
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(2);

    // Assert that the active enterprise customer user was NOT updated.
    expect(updateActiveEnterpriseCustomerUser).toHaveBeenCalledTimes(0);
  });
});
