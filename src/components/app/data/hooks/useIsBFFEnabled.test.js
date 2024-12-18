import { renderHook } from '@testing-library/react-hooks';
import useIsBFFEnabled from './useIsBFFEnabled';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useEnterpriseFeatures from './useEnterpriseFeatures';
import { isBFFEnabled } from '../utils';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useEnterpriseFeatures');
jest.mock('../utils', () => ({
  isBFFEnabled: jest.fn(),
}));

describe('useIsBFFEnabled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    { hasBFFEnabled: false },
    { hasBFFEnabled: true },
  ])('should return expected value based on whether BFF is enabled (%s)', ({ hasBFFEnabled }) => {
    const mockEnterpriseCustomer = { uuid: '12345' };
    const mockEnterpriseFeatures = { featureX: true };

    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseFeatures.mockReturnValue(mockEnterpriseFeatures);
    isBFFEnabled.mockReturnValue(hasBFFEnabled);

    const { result } = renderHook(() => useIsBFFEnabled());

    expect(useEnterpriseCustomer).toHaveBeenCalled();
    expect(useEnterpriseFeatures).toHaveBeenCalled();
    expect(isBFFEnabled).toHaveBeenCalledWith(mockEnterpriseCustomer.uuid, mockEnterpriseFeatures);
    expect(result.current).toBe(hasBFFEnabled);
  });
});
