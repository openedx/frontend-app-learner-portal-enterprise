import { renderHook } from '@testing-library/react-hooks';
import { useIsFirstRender } from '../hooks';

describe('useIsFirstRender', () => {
  it('should be true on first render and false after', () => {
    const { result, rerender } = renderHook(() => useIsFirstRender());
    expect(result.current).toEqual(true);
    rerender();
    expect(result.current).toEqual(false);
    rerender();
    expect(result.current).toEqual(false);
  });
});
