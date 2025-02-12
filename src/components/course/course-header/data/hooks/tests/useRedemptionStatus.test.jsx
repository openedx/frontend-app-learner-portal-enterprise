import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { act, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MOCK_COURSEWARE_URL } from './constants';
import useRedemptionStatus from '../useRedemptionStatus';

// mock global.location.href
delete global.location;
global.location = {
  assign: jest.fn(),
};

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useRedemptionStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderUseRedemptionStatusHook = (args) => renderHook(() => useRedemptionStatus(args), { wrapper });

  const validateOutput = (result) => {
    expect(result.current).toEqual(
      expect.objectContaining({
        redemptionStatus: undefined,
        handleRedeemClick: expect.any(Function),
        handleRedeemSuccess: expect.any(Function),
        handleRedeemError: expect.any(Function),
      }),
    );
  };

  const validateRedemptionClick = (result) => {
    act(() => {
      result.current.handleRedeemClick();
    });
    expect(result.current).toEqual(
      expect.objectContaining({
        redemptionStatus: undefined,
      }),
    );
  };

  it('return the correct arguments', () => {
    const { result } = renderUseRedemptionStatusHook();
    validateOutput(result);
  });

  it('handles redeem success', async () => {
    const locationAssignSpy = jest.spyOn(global.location, 'assign');
    const { result } = renderUseRedemptionStatusHook();
    validateOutput(result);
    act(() => {
      result.current.handleRedeemSuccess({
        coursewareUrl: MOCK_COURSEWARE_URL,
      });
    });
    expect(locationAssignSpy).toHaveBeenCalled();
    expect(result.current).toEqual(
      expect.objectContaining({
        redemptionStatus: 'success',
      }),
    );
    validateRedemptionClick(result);
  });

  it('handles redeem error', async () => {
    const locationAssignSpy = jest.spyOn(global.location, 'assign');
    const { result } = renderUseRedemptionStatusHook();
    validateOutput(result);
    act(() => {
      result.current.handleRedeemError();
    });
    expect(locationAssignSpy).not.toHaveBeenCalled();
    expect(result.current).toEqual(
      expect.objectContaining({
        redemptionStatus: 'error',
      }),
    );
    validateRedemptionClick(result);
  });
});
