import { act, renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import useRedemptionStatus from '../useRedemptionStatus';

const MOCK_COURSEWARE_URL = 'https://edx.org';

// mock global.location.href
delete global.location;
global.location = {
  assign: jest.fn(),
};

describe('useRedemptionStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    const { result } = renderHook(() => useRedemptionStatus());
    validateOutput(result);
  });

  it('handles redeem success', async () => {
    const locationAssignSpy = jest.spyOn(global.location, 'assign');

    const { result } = renderHook(() => useRedemptionStatus());
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

    const { result } = renderHook(() => useRedemptionStatus());
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
