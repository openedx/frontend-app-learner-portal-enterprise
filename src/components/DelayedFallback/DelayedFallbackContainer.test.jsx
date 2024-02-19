import { screen, waitFor, render } from '@testing-library/react';
import DelayedFallbackContainer from './DelayedFallbackContainer';

describe('<DelayedFallbackContainer />', () => {
  it('renders the default spinner', async () => {
    render(<DelayedFallbackContainer />);

    expect(screen.queryByTestId('delayed-fallback-container')).toBeFalsy();
    expect(screen.queryByTestId('suspense-spinner')).toBeFalsy();

    await waitFor(() => expect(screen.getByTestId('delayed-fallback-container')).toBeTruthy());
    await waitFor(() => expect(screen.getByTestId('suspense-spinner')).toBeTruthy());
  });
  it('renders a custom delayed feedback component', async () => {
    render(
      <DelayedFallbackContainer
        className="align-content-center"
        delay={1000}
      >
        <div data-testid="loading-component">
          Loading...
        </div>
      </DelayedFallbackContainer>,
    );
    expect(screen.queryByTestId('delayed-fallback-container')).toBeFalsy();
    expect(screen.queryByTestId('loading-component')).toBeFalsy();

    await waitFor(() => expect(screen.getByTestId('delayed-fallback-container')).toBeTruthy());
    await waitFor(() => expect(screen.queryByTestId('suspense-spinner')).toBeFalsy());
    await waitFor(() => expect(screen.getByTestId('loading-component')).toBeTruthy());
  });
});
