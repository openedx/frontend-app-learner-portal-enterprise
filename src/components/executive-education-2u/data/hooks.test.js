import { renderHook } from '@testing-library/react-hooks';
import { useLocation } from 'react-router-dom';

import { useActiveQueryParams } from './hooks';

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
