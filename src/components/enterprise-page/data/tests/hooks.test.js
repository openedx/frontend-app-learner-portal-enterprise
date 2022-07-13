import { renderHook } from '@testing-library/react-hooks';
import { useUpdateActiveEnterpriseForUser } from '../hooks';
import * as service from '../service';

jest.mock('../service');

describe('useUpdateActiveEnterpriseForUser', () => {
  const mockEnterpriseId = 'enterprise-uuid';
  const mockCurrentActiveEnterpriseId = 'current-active-enterprise-uuid';
  const mockUser = {
    roles: [`enterprise_learner:${mockCurrentActiveEnterpriseId}`],
  };

  afterEach(() => jest.clearAllMocks());

  it("should update user's active enterprise if it differs from the current enterprise", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUpdateActiveEnterpriseForUser({
      enterpriseId: mockEnterpriseId,
      user: mockUser,
    }));
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(service.updateUserActiveEnterprise).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
  });

  it.each([
    {
      enterpriseId: undefined,
      user: mockUser,
    },
    {
      enterpriseId: mockEnterpriseId,
      user: undefined,
    },
    {
      enterpriseId: mockEnterpriseId,
      user: {
        roles: [`enterprise_learner:${mockEnterpriseId}`],

      },
    },
  ])('should do nothing if missing enterpriseId or user, or active enterprise is the same as current enterprise', async (
    {
      enterpriseId,
      user,
    },
  ) => {
    renderHook(() => useUpdateActiveEnterpriseForUser({
      enterpriseId,
      user,
    }));

    expect(service.updateUserActiveEnterprise).toHaveBeenCalledTimes(0);
  });

  it('should handle errors', async () => {
    service.updateUserActiveEnterprise.mockRejectedValueOnce(Error('uh oh'));
    const { result, waitForNextUpdate } = renderHook(() => useUpdateActiveEnterpriseForUser({
      enterpriseId: mockEnterpriseId,
      user: mockUser,
    }));
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(service.updateUserActiveEnterprise).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
  });
});
