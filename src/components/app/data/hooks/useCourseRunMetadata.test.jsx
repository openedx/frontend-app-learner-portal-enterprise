import { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '../../../../utils/tests';
import { fetchCourseRunMetadata } from '../services';
import { useCourseRunMetadata } from './index';
import { COURSE_MODES_MAP } from '../constants';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchCourseRunMetadata: jest.fn().mockResolvedValue(null),
}));
const mockCourseRunMetadata = {
  seats: [{
    type: COURSE_MODES_MAP.AUDIT,
    price: '0.00',
    currency: 'USD',
    upgradeDeadline: null,
    upgradeDeadlineOverride: null,
    creditProvider: null,
    creditHours: null,
    sku: 'ABCDEFG',
    bulkSku: null,
  }],
  start: '2023-05-23T10:00:00Z',
  end: '2050-02-01T10:00:00Z',
  status: 'published',
  isEnrollable: true,
  isMarketable: true,
  availability: 'Current',
  key: 'course-v1:HarvardX+CS50x+2T2023',
  uuid: 'test-uuid',
  title: 'Introduction to Computer Science',
};

describe('useCourseRunMetadata', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchCourseRunMetadata.mockResolvedValue(mockCourseRunMetadata);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useCourseRunMetadata(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockCourseRunMetadata,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
