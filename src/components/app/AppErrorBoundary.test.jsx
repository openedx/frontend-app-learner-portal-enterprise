import { lazy } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AppErrorBoundary from './AppErrorBoundary';
import { RouterFallback } from './routes/RouterFallback';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../utils/tests';

jest.mock('./routes/RouterFallback', () => function MockRouterFallback() { return <div>Router Fallback Loading...</div>; });

const AppErrorBoundaryWrapper = ({ children, queryClientOptions = {} }) => {
  const mockQueryClient = queryClient(queryClientOptions);
  return (
    <QueryClientProvider client={mockQueryClient}>
      <IntlProvider locale="en">
        <AppErrorBoundary>
          {children}
        </AppErrorBoundary>
      </IntlProvider>
    </QueryClientProvider>
  );
};

describe('AppErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const ChildComponent = () => <div>Child Component</div>;
    render(
      <AppErrorBoundaryWrapper>
        <ChildComponent />
      </AppErrorBoundaryWrapper>,
    );
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('displays fallback UI when an error is thrown', () => {
    const ThrowingComponent = () => {
      throw new Error('Test Error');
    };
    render(
      <AppErrorBoundaryWrapper>
        <ThrowingComponent />
      </AppErrorBoundaryWrapper>,
    );
    expect(screen.getByText('An error occurred while processing your request')).toBeInTheDocument();
    expect(screen.getByText('We apologize for the inconvenience. Please try again later.')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('renders fallback UI for suspense errors', async () => {
    const LazyComponent = () => {
      const { data } = useQuery({
        queryKey: 'test',
        queryFn: async () => new Promise((resolve) => {
          setTimeout(() => {
            resolve({ result: 'Test Data' });
          }, 1000);
        }),
      });
      return <div>{data.result}</div>;
    };
    render(
      <AppErrorBoundaryWrapper queryClientOptions={{ queries: { suspense: true } }}>
        <LazyComponent />
      </AppErrorBoundaryWrapper>,
    );
    expect(screen.getByText('Router Fallback Loading...')).toBeInTheDocument();
    await screen.findByText('Test Data');
  });
});
