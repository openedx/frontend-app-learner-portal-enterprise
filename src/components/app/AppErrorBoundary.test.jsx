import { Suspense } from 'react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AppErrorBoundary from './AppErrorBoundary';
import { queryClient } from '../../utils/tests';
import { RouterFallback } from './routes';

jest.mock('./routes/RouterFallback', () => function MockRouterFallback() { return <div>Router Fallback Loading...</div>; });

const AppErrorBoundaryWrapper = ({ children }) => {
  const mockQueryClient = queryClient();
  return (
    <QueryClientProvider client={mockQueryClient}>
      <IntlProvider locale="en">
        <Suspense fallback={<RouterFallback loaderOptions={{ shouldCompleteBeforeUnmount: false }} />}>
          <AppErrorBoundary>
            {children}
          </AppErrorBoundary>
        </Suspense>
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
    const AsyncComponent = () => {
      const { data } = useQuery({
        queryKey: ['test-query'],
        queryFn: async () => new Promise((resolve) => {
          setTimeout(() => {
            resolve({ result: 'Test Data' });
          }, 1000);
        }),
      });
      return <div>{data.result}</div>;
    };
    render(
      <AppErrorBoundaryWrapper>
        <AsyncComponent />
      </AppErrorBoundaryWrapper>,
    );
    expect(screen.getByText('Router Fallback Loading...')).toBeInTheDocument();
    await waitFor(() => {
      const resultData = screen.getByText('Test Data');
      expect(resultData).toBeInTheDocument();
    });
  });
});
