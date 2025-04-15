import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../../utils/tests';
import makeProgramProgressLoader from '../programProgressLoader';
import { ensureAuthenticatedUser } from '../../../app/routes/data';
import {
  extractEnterpriseCustomer,
  queryLearnerProgramProgressData,
} from '../../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

jest.mock('../../../app/routes/data', () => ({
  ...jest.requireActual('../../../app/routes/data'),
  ensureAuthenticatedUser: jest.fn(),
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  extractEnterpriseCustomer: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockProgramUUID = 'test-program-uuid';
const mockProgramProgressURL = `/${mockEnterpriseCustomer.slug}/program/${mockProgramUUID}/progress`;

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue(),
};

describe('programProgressLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue(mockAuthenticatedUser);
    extractEnterpriseCustomer.mockResolvedValue(mockEnterpriseCustomer);
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/program/:programUUID/progress',
        element: <div>hello world</div>,
        loader: makeProgramProgressLoader(mockQueryClient),
      },
      {
        initialEntries: [mockProgramProgressURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it('ensures the requisite program progress data is resolved', async () => {
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/program/:programUUID/progress',
        element: <div>hello world</div>,
        loader: makeProgramProgressLoader(mockQueryClient),
      },
      {
        initialEntries: [mockProgramProgressURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryLearnerProgramProgressData(mockProgramUUID).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
