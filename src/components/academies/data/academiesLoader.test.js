/* eslint-disable react/jsx-filename-extension */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../utils/tests';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import { queryAcademiesDetail } from '../../app/data';
import makeAcademiesLoader from './academiesLoader';

jest.mock('../../app/routes/data', () => ({
  ...jest.requireActual('../../app/routes/data'),
  ensureAuthenticatedUser: jest.fn(),
}));

const mockEnterpriseId = 'test-enterprise-uuid';
const mockAcademyUUID = 'test-academy-uuid';
const mockAcademiesURL = `/${mockEnterpriseId}/academies/${mockAcademyUUID}`;

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
};

describe('academiesLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue({ userId: 3 });
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/academies/:academyUUID',
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
        path: '/:enterpriseSlug/academies/:academyUUID',
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
        queryKey: queryAcademiesDetail(mockAcademyUUID).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
