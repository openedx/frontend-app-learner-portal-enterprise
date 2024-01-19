import { renderHook } from '@testing-library/react-hooks';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useUpdateActiveEnterpriseForUser } from '../hooks';
import * as service from '../service';
import { queryCacheOnErrorHandler } from '../../../../utils/common';

jest.mock('../service');
jest.mock('../../../../utils/common');
jest.mock('@edx/frontend-platform/logging');

describe('useUpdateActiveEnterpriseForUser', () => {
  const mockEnterpriseId = 'enterprise-uuid';
  const mockUser = {
    username: 'shoe_shmoe',
  };
  const queryCache = new QueryCache({
    onError: queryCacheOnErrorHandler,
  });
  const queryClient = new QueryClient({
    queryCache,
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  afterEach(() => jest.resetAllMocks());
  beforeEach(() => {
    queryCache.clear();
    service.fetchEnterpriseLearnerData.mockResolvedValue(
      [{ enterpriseCustomer: { uuid: mockEnterpriseId }, active: true }],
    );
  });

  it("should update user's active enterprise if it differs from the current enterprise", async () => {
    service.fetchEnterpriseLearnerData.mockResolvedValue(
      [
        { enterpriseCustomer: { uuid: mockEnterpriseId }, active: false },
        { enterpriseCustomer: { uuid: 'some-other-uuid' }, active: true },
      ],
    );
    const { result, waitForNextUpdate } = renderHook(
      () => useUpdateActiveEnterpriseForUser({
        enterpriseId: mockEnterpriseId,
        user: mockUser,
      }),
      { wrapper },
    );
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(service.updateUserActiveEnterprise).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('should do nothing if active enterprise is the same as current enterprise', async () => {
    const { waitForNextUpdate } = renderHook(
      () => useUpdateActiveEnterpriseForUser({
        enterpriseId: mockEnterpriseId,
        user: mockUser,
      }),
      { wrapper },
    );
    await waitForNextUpdate();
    expect(service.fetchEnterpriseLearnerData).toHaveBeenCalledTimes(1);
    expect(service.updateUserActiveEnterprise).toHaveBeenCalledTimes(0);
  });

  it('should handle query errors', async () => {
    jest.setTimeout(10000);
    service.fetchEnterpriseLearnerData.mockRejectedValue(Error('uh oh'));
    const { result, waitForNextUpdate } = renderHook(
      () => useUpdateActiveEnterpriseForUser({
        enterpriseId: mockEnterpriseId,
        user: mockUser,
      }),
      { wrapper },
    );
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(service.fetchEnterpriseLearnerData).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(queryCacheOnErrorHandler).toBeCalled();
  });

  it('should handle mutation errors', async () => {
    jest.setTimeout(10000);
    service.fetchEnterpriseLearnerData.mockResolvedValue(
      [
        { enterpriseCustomer: { uuid: mockEnterpriseId }, active: false },
        { enterpriseCustomer: { uuid: 'some-other-uuid' }, active: true },
      ],
    );
    service.updateUserActiveEnterprise.mockRejectedValue(Error('uh oh'));
    const { result, waitForNextUpdate } = renderHook(
      () => useUpdateActiveEnterpriseForUser({
        enterpriseId: mockEnterpriseId,
        user: mockUser,
      }),
      { wrapper },
    );
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(service.updateUserActiveEnterprise).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(logError).toBeCalledWith("Failed to update user's active enterprise");
  });
});
