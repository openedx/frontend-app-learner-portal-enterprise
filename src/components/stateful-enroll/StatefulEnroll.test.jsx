import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import StatefulEnroll from './StatefulEnroll';
import {
  // useRedemptionMutation,
  // useTransactionStatus,
  submitRedemptionRequest,
  retrieveTransactionStatus,
} from './data';

// Create a client
const queryClient = new QueryClient();

const MOCK_USER_ID = 3;
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({
    id: MOCK_USER_ID,
  }),
}));

jest.mock('./data/service', () => ({
  ...jest.requireActual('./data/service'),
  submitRedemptionRequest: jest.fn(),
  retrieveTransactionStatus: jest.fn(),
}));

const mockOnClick = jest.fn();
const mockOnSuccess = jest.fn();
const mockOnError = jest.fn();

const StatefulEnrollWrapper = (props) => (
  <QueryClientProvider client={queryClient}>
    <IntlProvider locale="en">
      <StatefulEnroll
        onClick={mockOnClick}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        {...props}
      />
    </IntlProvider>
  </QueryClientProvider>
);

const MOCK_COURSE_RUN_KEY = 'course-v1:edX+S2023+1T2023';
const MOCK_TRANSACTION_UUID = 'test-transaction-uuid';

describe('StatefulEnroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const clickEnrollButton = async () => {
    const enrollBtn = screen.getByText('Enroll');
    userEvent.click(enrollBtn);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Enrolling...')).toBeInTheDocument();
  };

  const verifyRedemptionMutationArgs = () => {
    expect(submitRedemptionRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: MOCK_USER_ID,
        contentKey: MOCK_COURSE_RUN_KEY,
      }),
    );
  };

  it('should render with default "Enroll" label', () => {
    render(<StatefulEnrollWrapper contentKey={MOCK_COURSE_RUN_KEY} />);
    expect(screen.getByText('Enroll')).toBeInTheDocument();
  });

  it('should allow the button labels to be overriden', () => {
    render(
      <StatefulEnrollWrapper
        contentKey={MOCK_COURSE_RUN_KEY}
        labels={{
          default: 'Hello world',
        }}
      />,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should handle successful enrollment', async () => {
    render(<StatefulEnrollWrapper contentKey={MOCK_COURSE_RUN_KEY} />);
    submitRedemptionRequest.mockResolvedValueOnce({
      uuid: MOCK_TRANSACTION_UUID,
    });
    retrieveTransactionStatus.mockResolvedValueOnce({
      state: 'committed',
    });
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(await screen.findByText('Enrolled')).toBeInTheDocument();
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'committed',
      }),
    );
    expect(mockOnError).not.toBeCalled();
  });

  it('should handle redemption mutation request error', async () => {
    render(<StatefulEnrollWrapper contentKey={MOCK_COURSE_RUN_KEY} />);
    submitRedemptionRequest.mockRejectedValueOnce();
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(await screen.findByText('Try again')).toBeInTheDocument();
    expect(mockOnSuccess).not.toBeCalled();
    expect(mockOnError).toHaveBeenCalledTimes(1);
  });

  it.only('should handle transaction status request error', async () => {
    render(<StatefulEnrollWrapper contentKey={MOCK_COURSE_RUN_KEY} />);
    submitRedemptionRequest.mockResolvedValueOnce({
      uuid: MOCK_TRANSACTION_UUID,
    });
    retrieveTransactionStatus.mockRejectedValue();
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    await waitFor(() => {
      expect(screen.getByText('Try again'));
    }, { timeout: 30000 });
  }, 30000);

  it('should handle transaction status error', async () => {
    render(<StatefulEnrollWrapper contentKey={MOCK_COURSE_RUN_KEY} />);
    submitRedemptionRequest.mockResolvedValueOnce({
      uuid: MOCK_TRANSACTION_UUID,
    });
    retrieveTransactionStatus.mockResolvedValueOnce({
      state: 'error',
    });
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(await screen.findByText('Try again')).toBeInTheDocument();
    expect(mockOnSuccess).not.toBeCalled();
    expect(mockOnError).toHaveBeenCalledTimes(1);
  });

  it('should handle transaction status pending', async () => {
    render(<StatefulEnrollWrapper contentKey={MOCK_COURSE_RUN_KEY} />);
    submitRedemptionRequest.mockResolvedValueOnce({
      uuid: MOCK_TRANSACTION_UUID,
    });
    retrieveTransactionStatus.mockResolvedValueOnce({
      state: 'pending',
    });
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(mockOnSuccess).not.toBeCalled();
    expect(mockOnError).not.toBeCalled();
  });
});
