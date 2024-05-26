/* eslint-disable react/jsx-filename-extension */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../utils/tests';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseCustomer, queryAcademiesDetail } from '../../app/data';
import makeAcademiesLoader from './academiesLoader';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/routes/data', () => ({
  ...jest.requireActual('../../app/routes/data'),
  ensureAuthenticatedUser: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  extractEnterpriseCustomer: jest.fn(),
  updateUserActiveEnterprise: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseSlug = mockEnterpriseCustomer.slug;
const mockEnterpriseId = mockEnterpriseCustomer.uuid;
const mockAcademyUUID = 'test-academy-uuid';
const mockAcademiesURL = `/${mockEnterpriseSlug}/academies/${mockAcademyUUID}/`;

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
};

describe('academiesLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue(mockAuthenticatedUser);
    extractEnterpriseCustomer.mockResolvedValue(mockEnterpriseCustomer);
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/academies/:academyUUID/',
        element: <div>hello world</div>,
        loader: makeAcademiesLoader(mockQueryClient),
      },
      {
        initialEntries: [mockAcademiesURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it('ensures the requisite academies data is resolved', async () => {
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/academies/:academyUUID/',
        element: <div>hello world</div>,
        loader: makeAcademiesLoader(mockQueryClient),
      },
      {
        initialEntries: [mockAcademiesURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryAcademiesDetail(mockAcademyUUID, mockEnterpriseId).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
