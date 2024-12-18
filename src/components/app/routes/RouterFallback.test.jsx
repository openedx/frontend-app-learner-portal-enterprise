import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import RouterFallback from './RouterFallback';
import { useNProgressLoader } from '../data';

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useNProgressLoader: jest.fn(),
}));

describe('RouterFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    const { container } = render(<RouterFallback />);
    expect(container).toBeEmptyDOMElement();
    expect(useNProgressLoader).toHaveBeenCalledTimes(1);
  });
});
