import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { render } from 'react-dom';

import {
  APP_INIT_ERROR,
  APP_READY,
  mergeConfig,
  initialize,
  subscribe,
} from '@edx/frontend-platform';

import '.';

jest.mock('react-dom', () => ({
  render: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  subscribe: jest.fn().mockReturnValue('subscribe!!!'),
  initialize: jest.fn(),
  mergeConfig: jest.fn(),
  APP_INIT_ERROR: 'app-init-error',
  APP_READY: 'app-ready',
}));

jest.mock('./components/app', () => ({
  App: () => <div data-testid="app" />,
}));

describe('App', () => {
  let spy;

  beforeAll(() => {
    spy = jest.spyOn(document, 'getElementById').mockImplementation(targetEl => targetEl);
  });

  it('calls initialize', () => {
    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('handles APP_READY event', async () => {
    const args = subscribe.mock.calls[0];
    expect(args[0]).toEqual(APP_READY);
    expect(args[1]).toBeInstanceOf(Function);
    args[1]();
    const [Component, targetElement] = render.mock.calls[0];
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('root');
    expect(targetElement).toEqual('root');
    render(Component);
    await waitFor(() => {
      expect(screen.getByTestId('app')).toBeInTheDocument();
    });
  });

  it('handles APP_INIT_ERROR event', () => {

  });
});
