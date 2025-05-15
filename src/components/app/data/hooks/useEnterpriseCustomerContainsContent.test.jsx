import { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseCustomerContainsContent } from '../services';
import {
  useEnterpriseCustomerContainsContent,
  useEnterpriseCustomerContainsContentSuspense,
} from './useEnterpriseCustomerContainsContent';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseCustomerContainsContent: jest.fn().mockResolvedValue(null),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerContainsContent = {
  containsContentItems: false,
  catalogList: [],
};

const BaseWrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>
    {children}
  </QueryClientProvider>
);

const Wrapper = ({ children, options = {} }) => {
  const { suspense = false } = options;
  if (suspense) {
    return (
      <BaseWrapper>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </BaseWrapper>
    );
  }
  return (
    <BaseWrapper>
      {children}
    </BaseWrapper>
  );
};

const WrapperWithSuspense = ({ children }) => (
  <Wrapper options={{ suspense: true }}>
    {children}
  </Wrapper>
);

describe('useEnterpriseCustomerContainsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchEnterpriseCustomerContainsContent.mockResolvedValue(mockEnterpriseCustomerContainsContent);
  });

  it('should return the correct value', async () => {
    const { result } = renderHook(
      () => useEnterpriseCustomerContainsContent(),
      { wrapper: Wrapper },
    );
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockEnterpriseCustomerContainsContent,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});

describe('useEnterpriseCustomerContainsContentSuspense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchEnterpriseCustomerContainsContent.mockResolvedValue(mockEnterpriseCustomerContainsContent);
  });

  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(
      () => useEnterpriseCustomerContainsContentSuspense(),
      { wrapper: WrapperWithSuspense },
    );
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockEnterpriseCustomerContainsContent,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
