import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderHook } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import useCourseRunCardAction from '../useCourseRunCardAction';

import StatefulEnroll from '../../../../../stateful-enroll';
import { NavigateToCourseware } from '../../../course-run-actions';
import {
  MOCK_COURSE_RUN_KEY,
  MOCK_COURSE_RUN_URL,
  MOCK_ENROLLMENT_VERIFIED,
  MOCK_ENROLLMENT_AUDIT,
  MOCK_REDEEMABLE_SUBSIDY,
} from './constants';

jest.mock('../../../../../stateful-enroll', () => jest.fn(() => <div data-testid="stateful-enroll" />));
jest.mock('../../../RedemptionStatusText', () => jest.fn(() => <div data-testid="redemption-status-text" />));
jest.mock('../../../RedemptionStatusText', () => jest.fn(() => <div data-testid="redemption-status-text" />));
jest.mock('../../../course-run-actions', () => ({
  NavigateToCourseware: jest.fn(() => <div data-testid="navigate-to-courseware" />),
}));
const mockRedemptionActions = {
  redemptionStatus: undefined,
  handleRedeemClick: jest.fn(),
  handleRedeemSuccess: jest.fn(),
  handleRedeemError: jest.fn(),
};
jest.mock('../useRedemptionStatus', () => jest.fn(() => mockRedemptionActions));

const wrapper = ({ children }) => (
  <IntlProvider locale="en">{children}</IntlProvider>
);

const renderUseCourseRunCardActionHook = (args) => {
  const { result } = renderHook(
    () => useCourseRunCardAction(args),
    { wrapper },
  );
  const { getByTestId } = render(result.current);
  return {
    result,
    getByTestId,
  };
};

describe('useCourseRunCardAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns stateful enroll if user is not yet enrolled', () => {
    const { getByTestId } = renderUseCourseRunCardActionHook({
      isUserEnrolled: false,
      userEnrollment: undefined,
      courseRunUrl: MOCK_COURSE_RUN_URL,
      contentKey: MOCK_COURSE_RUN_KEY,
      userSubsidyApplicableToCourse: undefined,
    });

    // expected components exists
    expect(getByTestId('stateful-enroll')).toBeInTheDocument();
    expect(getByTestId('redemption-status-text')).toBeInTheDocument();

    // verify props passed into children components
    expect(StatefulEnroll.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        contentKey: MOCK_COURSE_RUN_KEY,
        onClick: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it('returns courseware CTA if user is already enrolled (verified mode)', () => {
    const { getByTestId } = renderUseCourseRunCardActionHook({
      isUserEnrolled: true,
      userEnrollment: MOCK_ENROLLMENT_VERIFIED,
      courseRunUrl: MOCK_COURSE_RUN_URL,
      contentKey: MOCK_COURSE_RUN_KEY,
      userSubsidyApplicableToCourse: undefined,
    });

    // expected components exists
    expect(getByTestId('navigate-to-courseware')).toBeInTheDocument();
    expect(getByTestId('redemption-status-text')).toBeInTheDocument();

    // verify props passed into children components
    expect(NavigateToCourseware.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        shouldUpgradeUserEnrollment: false,
        userSubsidyApplicableToCourse: undefined,
        contentKey: MOCK_COURSE_RUN_KEY,
        courseRunUrl: MOCK_COURSE_RUN_URL,
        onUpgradeClick: expect.any(Function),
        onUpgradeSuccess: expect.any(Function),
        onUpgradeError: expect.any(Function),
      }),
    );
  });

  it('returns courseware CTA if user is already enrolled (audit mode) without upgrade', () => {
    const { getByTestId } = renderUseCourseRunCardActionHook({
      isUserEnrolled: true,
      userEnrollment: MOCK_ENROLLMENT_AUDIT,
      courseRunUrl: MOCK_COURSE_RUN_URL,
      contentKey: MOCK_COURSE_RUN_KEY,
      userSubsidyApplicableToCourse: undefined,
    });

    // expected components exists
    expect(getByTestId('navigate-to-courseware')).toBeInTheDocument();
    expect(getByTestId('redemption-status-text')).toBeInTheDocument();

    // verify props passed into children components
    expect(NavigateToCourseware.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        shouldUpgradeUserEnrollment: false,
        userSubsidyApplicableToCourse: undefined,
        contentKey: MOCK_COURSE_RUN_KEY,
        courseRunUrl: MOCK_COURSE_RUN_URL,
        onUpgradeClick: expect.any(Function),
        onUpgradeSuccess: expect.any(Function),
        onUpgradeError: expect.any(Function),
      }),
    );
  });

  it('returns courseware CTA if user is already enrolled (audit mode) with upgrade', () => {
    const { getByTestId } = renderUseCourseRunCardActionHook({
      isUserEnrolled: true,
      userEnrollment: MOCK_ENROLLMENT_AUDIT,
      courseRunUrl: MOCK_COURSE_RUN_URL,
      contentKey: MOCK_COURSE_RUN_KEY,
      userSubsidyApplicableToCourse: MOCK_REDEEMABLE_SUBSIDY,
    });

    // expected components exists
    expect(getByTestId('navigate-to-courseware')).toBeInTheDocument();
    expect(getByTestId('redemption-status-text')).toBeInTheDocument();

    // verify props passed into children components
    expect(NavigateToCourseware.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        shouldUpgradeUserEnrollment: true,
        userSubsidyApplicableToCourse: MOCK_REDEEMABLE_SUBSIDY,
        contentKey: MOCK_COURSE_RUN_KEY,
        courseRunUrl: MOCK_COURSE_RUN_URL,
        onUpgradeClick: expect.any(Function),
        onUpgradeSuccess: expect.any(Function),
        onUpgradeError: expect.any(Function),
      }),
    );
  });
});
