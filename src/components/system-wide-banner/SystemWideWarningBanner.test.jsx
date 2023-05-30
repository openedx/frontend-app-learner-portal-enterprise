import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { screen } from '@testing-library/react';
import SystemWideWarningBanner from './SystemWideWarningBanner';
import '@testing-library/jest-dom/extend-expect';

describe('SystemWideWarningBanner', () => {
  it('renders correctly', () => {
    renderWithRouter(
      <SystemWideWarningBanner>Test</SystemWideWarningBanner>,
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
