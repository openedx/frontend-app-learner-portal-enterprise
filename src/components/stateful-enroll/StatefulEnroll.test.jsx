import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import StatefulEnroll from './StatefulEnroll';
import { useStatefulEnroll } from './data';
import { useUserSubsidyApplicableToCourse } from '../course/data';

const mockRedeem = jest.fn();
jest.mock('./data', () => ({
  ...jest.requireActual('./data'),
  useStatefulEnroll: jest.fn(() => mockRedeem),
}));
jest.mock('../course/data', () => ({
  useUserSubsidyApplicableToCourse: jest.fn(),
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

const StatefulEnrollWrapper = (props) => (
  <IntlProvider locale="en">
    <StatefulEnroll
      contentKey={MOCK_COURSE_RUN_KEY}
      {...mockCallbackProps}
      {...props}
    />
  </IntlProvider>
);

describe('StatefulEnroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserSubsidyApplicableToCourse.mockReturnValue(MOCK_SUBSIDY_ACCESS_POLICY);
  });

  const clickEnrollButton = async () => {
    expect(useStatefulEnroll).toHaveBeenCalledTimes(1);
    const enrollBtn = screen.getByText('Enroll');
    const user = userEvent.setup();
    await user.click(enrollBtn);
    const onClickSpy = jest.spyOn(mockCallbackProps, 'onClick');
    expect(onClickSpy).toHaveBeenCalledTimes(1);
    expect(mockRedeem).toHaveBeenCalledTimes(1);
    // kick off the `onBeginRedeem` callback function passed to `useStatefulEnroll`
    act(() => {
      useStatefulEnroll.mock.calls[0][0].onBeginRedeem();
    });
    expect(await screen.findByText('Enrolling...')).toBeInTheDocument();
  };

  it('should render with default "Enroll" label', () => {
    render(<StatefulEnrollWrapper />);
    expect(screen.getByText('Enroll')).toBeInTheDocument();
  });

  it('should allow the button labels to be overridden', () => {
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
    await clickEnrollButton();

    act(() => {
      useStatefulEnroll.mock.calls[0][0].onSuccess({
        state: 'committed',
      });
    });

    expect(await screen.findByText('Enrolled')).toBeInTheDocument();
    expect(onSuccessSpy).toHaveBeenCalledTimes(1);
    expect(onSuccessSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'committed',
      }),
    );
    expect(onErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle redemption error', async () => {
    render(<StatefulEnrollWrapper />);
    const onSuccessSpy = jest.spyOn(mockCallbackProps, 'onSuccess');
    const onErrorSpy = jest.spyOn(mockCallbackProps, 'onError');
    await clickEnrollButton();

    act(() => {
      useStatefulEnroll.mock.calls[0][0].onError(new Error('oh noes!'));
    });

    expect(await screen.findByText('Try again')).toBeInTheDocument();
    expect(onSuccessSpy).not.toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalledTimes(1);
  });
});
