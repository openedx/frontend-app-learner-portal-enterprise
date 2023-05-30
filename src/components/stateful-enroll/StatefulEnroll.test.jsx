import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import StatefulEnroll from './StatefulEnroll';
import { useStatefullEnroll } from './data';

const mockRedeem = jest.fn();
jest.mock('./data', () => ({
  ...jest.requireActual('./data'),
  useStatefullEnroll: jest.fn(() => ({ redeem: mockRedeem })),
}));

const mockCallbackProps = {
  onClick: jest.fn(),
  onSuccess: jest.fn(),
  onError: jest.fn(),
};

const MOCK_COURSE_RUN_KEY = 'course-v1:edX+S2023+1T2023';
const MOCK_SUBSIDY_ACCESS_POLICY = {
  policyRedemptionUrl: 'http://policy-redemption.url',
};
const MOCK_TRANSACTION_STATUS_API_URL = 'http://transaction-status.url';

const StatefulEnrollWrapper = (props) => (
  <IntlProvider locale="en">
    <StatefulEnroll
      contentKey={MOCK_COURSE_RUN_KEY}
      subsidyAccessPolicy={MOCK_SUBSIDY_ACCESS_POLICY}
      {...mockCallbackProps}
      {...props}
    />
  </IntlProvider>
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

  // const verifyRedemptionMutationArgs = () => {
  //   expect(submitRedemptionRequest).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       userId: MOCK_USER_ID,
  //       contentKey: MOCK_COURSE_RUN_KEY,
  //       policyRedemptionUrl: MOCK_SUBSIDY_ACCESS_POLICY.policyRedemptionUrl,
  //     }),
  //   );
  // };

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

  it.only('should handle successful enrollment', async () => {
    render(<StatefulEnrollWrapper />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    // submitRedemptionRequest.mockResolvedValueOnce({
    //   transactionStatusApiUrl: MOCK_TRANSACTION_STATUS_API_URL,
    // });
    // retrieveTransactionStatus.mockResolvedValueOnce({
    //   state: 'committed',
    // });
    await clickEnrollButton();
    // verifyRedemptionMutationArgs();
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
    // submitRedemptionRequest.mockResolvedValueOnce({
    //   transactionStatusApiUrl: MOCK_TRANSACTION_STATUS_API_URL,
    // });
    // retrieveTransactionStatus.mockResolvedValueOnce({
    //   state: 'pending',
    // });
    await clickEnrollButton();
    // verifyRedemptionMutationArgs();
    expect(onSuccessSpy).not.toHaveBeenCalled();
    expect(onErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle redemption mutation request error', async () => {
    render(<StatefulEnrollWrapper />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    // submitRedemptionRequest.mockRejectedValueOnce();
    await clickEnrollButton();
    // verifyRedemptionMutationArgs();
    expect(await screen.findByText('Try again')).toBeInTheDocument();
    expect(onSuccessSpy).not.toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle transaction status error', async () => {
    render(<StatefulEnrollWrapper />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    // submitRedemptionRequest.mockResolvedValueOnce({
    //   transactionStatusApiUrl: MOCK_TRANSACTION_STATUS_API_URL,
    // });
    // retrieveTransactionStatus.mockResolvedValueOnce({
    //   state: 'failed',
    // });
    await clickEnrollButton();
    // verifyRedemptionMutationArgs();
    expect(await screen.findByText('Try again')).toBeInTheDocument();
    expect(onSuccessSpy).not.toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle transaction status request error', async () => {
    render(<StatefulEnrollWrapper />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    // submitRedemptionRequest.mockResolvedValueOnce({
    //   transactionStatusApiUrl: MOCK_TRANSACTION_STATUS_API_URL,
    // });
    // retrieveTransactionStatus.mockRejectedValueOnce();
    await clickEnrollButton();
    // verifyRedemptionMutationArgs();
    expect(await screen.findByText('Try again')).toBeInTheDocument();
    expect(onSuccessSpy).not.toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalledTimes(1);
  });
});
