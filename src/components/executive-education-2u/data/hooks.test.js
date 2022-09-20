import { renderHook } from '@testing-library/react-hooks';
import { useLocation } from 'react-router-dom';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

import {
  useActiveQueryParams,
  useExecutiveEducation2UContentMetadata,
} from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

describe('useActiveQueryParams', () => {
  it('should parse location search as URLSearchParams', () => {
    useLocation.mockReturnValue({ search: 'foo=bar' });
    const { result } = renderHook(() => useActiveQueryParams());
    expect(result.current.has('foo')).toEqual(true);
  });
});

describe('useExecutiveEducation2UContentMetadata', () => {
  it('should not fetch content metadata if Exec Ed (2U) fulfillment is not enabled', () => {
    const args = {
      courseUUID: undefined,
      isExecEd2UFulfillmentEnabled: false,
    };
    const { result } = renderHook(() => useExecutiveEducation2UContentMetadata(args));

    expect(result.current.isLoadingContentMetadata).toEqual(false);
    expect(result.current.contentMetadata).toEqual(undefined);
  });

  it('should fetch content metadata', async () => {
    const courseUUID = 'test-course-uuid';
    getAuthenticatedHttpClient.mockImplementation(() => ({
      get: jest.fn(() => Promise.resolve({
        data: {
          results: [{ uuid: courseUUID }],
        },
      })),
    }));
    const args = {
      courseUUID,
      isExecEd2UFulfillmentEnabled: true,
    };
    const { result, waitForNextUpdate } = renderHook(() => useExecutiveEducation2UContentMetadata(args));

    expect(result.current.isLoadingContentMetadata).toEqual(true);
    expect(result.current.contentMetadata).toEqual(undefined);

    await waitForNextUpdate();

    expect(result.current.isLoadingContentMetadata).toEqual(false);
    expect(result.current.contentMetadata).toEqual(
      expect.objectContaining({
        uuid: expect.any(String),
      }),
    );
  });

  it('should handle fetch content metadata error', async () => {
    const courseUUID = 'test-course-uuid';
    const mockError = new Error('oh noes');
    getAuthenticatedHttpClient.mockImplementation(() => ({
      get: jest.fn(() => Promise.reject(mockError)),
    }));
    const args = {
      courseUUID,
      isExecEd2UFulfillmentEnabled: true,
    };
    const { result, waitForNextUpdate } = renderHook(() => useExecutiveEducation2UContentMetadata(args));

    expect(result.current.isLoadingContentMetadata).toEqual(true);
    expect(result.current.contentMetadata).toEqual(undefined);

    await waitForNextUpdate();

    expect(result.current.isLoadingContentMetadata).toEqual(false);
    expect(result.current.contentMetadata).toEqual(undefined);

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(mockError);
  });
});
