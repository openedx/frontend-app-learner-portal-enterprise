import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import StatefulEnroll from './StatefulEnroll';
import {
  submitRedemptionRequest,
  retrieveTransactionStatus,
} from './data';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // disable query retries as `react-query` defaults to 3 retry attempts
      // with exponential backoff, which may cause tests to timeout
      retry: false,
    },
  },
});

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

const mockCallbackProps = {
  onClick: jest.fn(),
  onSuccess: jest.fn(),
  onError: jest.fn(),
};

const MOCK_COURSE_RUN_KEY = 'course-v1:edX+S2023+1T2023';
const MOCK_TRANSACTION_UUID = 'test-transaction-uuid';

const StatefulEnrollWrapper = (props) => (
  <QueryClientProvider client={queryClient}>
    <IntlProvider locale="en">
      <StatefulEnroll
        contentKey={MOCK_COURSE_RUN_KEY}
        {...mockCallbackProps}
        {...props}
      />
    </IntlProvider>
  </QueryClientProvider>
);

describe('StatefulEnroll', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const clickEnrollButton = async (options = {}) => {
    const enrollBtn = screen.getByText('Enroll');
    userEvent.click(enrollBtn);
    if (!options.ignoreOnClick) {
      const onClickSpy = jest.spyOn(mockCallbackProps, 'onClick');
      expect(onClickSpy).toHaveBeenCalledTimes(1);
    }
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
    render(<StatefulEnrollWrapper />);
    expect(screen.getByText('Enroll')).toBeInTheDocument();
  });

  it('should allow the button labels to be overriden', () => {
    render(
      <StatefulEnrollWrapper
        labels={{
          default: 'Hello world',
        }}
      />,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should handle successful enrollment', async () => {
    render(<StatefulEnrollWrapper />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    submitRedemptionRequest.mockResolvedValueOnce({
      uuid: MOCK_TRANSACTION_UUID,
    });
    retrieveTransactionStatus.mockResolvedValueOnce({
      state: 'committed',
    });
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(await screen.findByText('Enrolled')).toBeInTheDocument();
    expect(onSuccessSpy).toHaveBeenCalledTimes(1);
    expect(onSuccessSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'committed',
      }),
    );
    expect(onErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle transaction status pending', async () => {
    render(<StatefulEnrollWrapper />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    submitRedemptionRequest.mockResolvedValueOnce({
      uuid: MOCK_TRANSACTION_UUID,
    });
    retrieveTransactionStatus.mockResolvedValueOnce({
      state: 'pending',
    });
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(onSuccessSpy).not.toHaveBeenCalled();
    expect(onErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle redemption mutation request error', async () => {
    render(<StatefulEnrollWrapper />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    submitRedemptionRequest.mockRejectedValueOnce();
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(await screen.findByText('Try again')).toBeInTheDocument();
    expect(onSuccessSpy).not.toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle transaction status error', async () => {
    render(<StatefulEnrollWrapper />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    submitRedemptionRequest.mockResolvedValueOnce({
      uuid: MOCK_TRANSACTION_UUID,
    });
    retrieveTransactionStatus.mockResolvedValueOnce({
      state: 'error',
    });
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(await screen.findByText('Try again')).toBeInTheDocument();
    expect(onSuccessSpy).not.toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle transaction status request error', async () => {
    render(<StatefulEnrollWrapper />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    submitRedemptionRequest.mockResolvedValueOnce({
      uuid: MOCK_TRANSACTION_UUID,
    });
    retrieveTransactionStatus.mockRejectedValueOnce();
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(await screen.findByText('Try again')).toBeInTheDocument();
    expect(onSuccessSpy).not.toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('handles missing onClick callback prop', async () => {
    render(<StatefulEnrollWrapper onClick={undefined} />);
    expect(screen.getByText('Enroll')).toBeInTheDocument();
    submitRedemptionRequest.mockResolvedValueOnce({
      uuid: MOCK_TRANSACTION_UUID,
    });
    retrieveTransactionStatus.mockResolvedValueOnce({
      state: 'committed',
    });
    await clickEnrollButton({ ignoreOnClick: true });
  });

  it('handles missing onSuccess callback prop', async () => {
    render(<StatefulEnrollWrapper onSuccess={undefined} />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    expect(screen.getByText('Enroll')).toBeInTheDocument();
    submitRedemptionRequest.mockResolvedValueOnce({
      uuid: MOCK_TRANSACTION_UUID,
    });
    retrieveTransactionStatus.mockResolvedValueOnce({
      state: 'committed',
    });
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(await screen.findByText('Enrolled')).toBeInTheDocument();
    expect(onSuccessSpy).not.toHaveBeenCalled();
  });

  it('handles missing onError callback prop', async () => {
    render(<StatefulEnrollWrapper onError={undefined} />);
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    submitRedemptionRequest.mockRejectedValueOnce();
    await clickEnrollButton();
    verifyRedemptionMutationArgs();
    expect(await screen.findByText('Try again')).toBeInTheDocument();
    expect(onErrorSpy).not.toHaveBeenCalled();
  });
});
