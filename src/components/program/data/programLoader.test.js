/* eslint-disable react/jsx-filename-extension */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../utils/tests';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseCustomer, queryEnterpriseProgram } from '../../app/data';
import makeProgramLoader from './programLoader';

jest.mock('../../app/routes/data', () => ({
  ...jest.requireActual('../../app/routes/data'),
  ensureAuthenticatedUser: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  extractEnterpriseCustomer: jest.fn(),
}));

const mockEnterpriseId = 'test-enterprise-uuid';
const mockProgramUUID = 'test-program-uuid';
const mockProgramsURL = `/${mockEnterpriseId}/program/${mockProgramUUID}`;

extractEnterpriseCustomer.mockResolvedValue({ uuid: mockEnterpriseId });

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
};

describe('progressLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue({ userId: 3 });
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/program/:programUUID',
        element: <div>hello world</div>,
        loader: makeProgramLoader(mockQueryClient),
      },
      {
        initialEntries: [mockProgramsURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it('ensures the requisite program data is resolved', async () => {
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/program/:programUUID',
        element: <div>hello world</div>,
        loader: makeProgramLoader(mockQueryClient),
      },
      {
        initialEntries: [mockProgramsURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryEnterpriseProgram(mockEnterpriseId, mockProgramUUID).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
