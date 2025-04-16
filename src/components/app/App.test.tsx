import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { keepPreviousData, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter } from 'react-router-dom';
import App from './App';
import { createAppRouter } from './routes';
import { defaultQueryClientRetryHandler } from '../../utils/common';

jest.mock('./routes', () => ({
  ...jest.requireActual('./routes'),
  createAppRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid="react-query-devtools">ReactQueryDevtools</div>,
}));

jest.mock('@tanstack/react-query-devtools/production', () => ({
  ReactQueryDevtools: () => <div data-testid="react-query-devtools-production">ReactQueryDevtoolsProduction</div>,
}));

jest.mock('@edx/frontend-platform/react', () => ({
  AppProvider: ({ children }) => <div data-testid="app-provider">{children}</div>,
}));

describe('App', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    const mockRouter = createMemoryRouter(
      [{ path: '/', element: <div data-testid="mock-route">Mock Route</div> }],
      { initialEntries: ['/'] },
    );
    (createAppRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders App component without errors', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('app-provider')).toBeInTheDocument();
  });

  test('toggles ReactQueryDevtoolsProduction visibility', async () => {
    render(<App />);

    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument();

    // Toggle visibility ON
    act(() => {
      // @ts-ignore
      window.toggleReactQueryDevtools();
    });
    await waitFor(() => {
      expect(screen.getByTestId('react-query-devtools-production')).toBeInTheDocument();
    });

    // Toggle visibility OFF
    act(() => {
      // @ts-ignore
      window.toggleReactQueryDevtools();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('react-query-devtools-production')).not.toBeInTheDocument();
    });
  });

  test('uses the custom router created by createAppRouter', () => {
    render(<App />);

    expect(createAppRouter).toHaveBeenCalledTimes(1);
    const actualQueryClient: QueryClient = (createAppRouter as jest.Mock).mock.calls[0][0];
    const actualDefaultOptions = actualQueryClient.getDefaultOptions();
    expect(actualDefaultOptions).toEqual(
      expect.objectContaining({
        queries: expect.objectContaining({
          staleTime: 1000 * 20, // 20 seconds
          placeholderData: keepPreviousData,
          retry: defaultQueryClientRetryHandler,
        }),
      }),
    );

    expect(screen.getByTestId('mock-route')).toBeInTheDocument();
  });
});
