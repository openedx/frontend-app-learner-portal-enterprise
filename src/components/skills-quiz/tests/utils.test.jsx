import { screen } from '@testing-library/react';
import { renderWithSearchContext } from './utils';

describe('SkillsContextProvider', () => {
  it('should render children', () => {
    renderWithSearchContext(<div>Test</div>);
    expect(screen.getByText('Test')).toBeTruthy();
  });
});
