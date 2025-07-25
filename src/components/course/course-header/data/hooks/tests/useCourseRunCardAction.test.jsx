import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import useCourseRunCardAction from '../useCourseRunCardAction';

import StatefulEnroll from '../../../../../stateful-enroll';
import { NavigateToCourseware } from '../../../course-run-actions';
import {
  MOCK_COURSE,
  MOCK_COURSE_RUN_KEY,
  MOCK_COURSE_RUN_URL,
  MOCK_ENROLLMENT_VERIFIED,
  MOCK_ENROLLMENT_AUDIT,
  MOCK_REDEEMABLE_SUBSIDY,
} from './constants';
import {
  useUserSubsidyApplicableToCourse,
  useUserHasSubsidyRequestForCourse,
  useUserHasLearnerCreditRequestForCourse,
} from '../../../../data';

jest.mock('../../../../../stateful-enroll', () => jest.fn(() => <div data-testid="stateful-enroll" />));
jest.mock('../../../RedemptionStatusText', () => jest.fn(() => <div data-testid="redemption-status-text" />));
jest.mock('../../../../enrollment/components/ToExecutiveEducation2UEnrollment', () => jest.fn(() => <div data-testid="to-executive-education-2u" />));
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
jest.mock('../../../../data', () => ({
  ...jest.requireActual('../../../../data'),
  useUserSubsidyApplicableToCourse: jest.fn(),
  useUserHasSubsidyRequestForCourse: jest.fn(),
  useUserHasLearnerCreditRequestForCourse: jest.fn(),
}));

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
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: undefined,
      isPending: false,
    });
    useUserHasSubsidyRequestForCourse.mockReturnValue(false);
    useUserHasLearnerCreditRequestForCourse.mockReturnValue(false);
  });

  it('returns null if user has a pending subsidy request', () => {
    useUserHasSubsidyRequestForCourse.mockReturnValue(true);
    const { result } = renderUseCourseRunCardActionHook({
      isUserEnrolled: false,
      course: MOCK_COURSE,
    });
    expect(result.current).toBeNull();
  });

  it('returns null if user has a pending learner credit request', () => {
    useUserHasLearnerCreditRequestForCourse.mockReturnValue(true);
    const { result } = renderUseCourseRunCardActionHook({
      isUserEnrolled: false,
      course: MOCK_COURSE,
    });
    expect(result.current).toBeNull();
  });

  it('returns disabled enroll button if user is not yet enrolled and does not have a subsidy access policy', () => {
    const { getByTestId } = renderUseCourseRunCardActionHook({
      isUserEnrolled: false,
      userEnrollment: undefined,
      courseRunUrl: MOCK_COURSE_RUN_URL,
      externalCourseEnrollmentUrl: undefined,
      contentKey: MOCK_COURSE_RUN_KEY,
      course: MOCK_COURSE,
    });

    // expected disabled button exists
    expect(getByTestId('disabled-enroll-missing-subsidy-access-policy')).toBeInTheDocument();
  });

  it('returns button link to course route for the given course type', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: MOCK_REDEEMABLE_SUBSIDY,
    });
    const { getByTestId } = renderUseCourseRunCardActionHook({
      isUserEnrolled: false,
      userEnrollment: undefined,
      courseRunUrl: MOCK_COURSE_RUN_URL,
      externalCourseEnrollmentUrl: '/enterprise-slug/executive-education-2u',
      contentKey: MOCK_COURSE_RUN_KEY,
      course: MOCK_COURSE,
    });

    expect(getByTestId('to-executive-education-2u')).toBeInTheDocument();
  });

  it('returns stateful enroll if user is not yet enrolled and has a subsidy access policy', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: MOCK_REDEEMABLE_SUBSIDY,
    });
    const { getByTestId } = renderUseCourseRunCardActionHook({
      isUserEnrolled: false,
      userEnrollment: undefined,
      courseRunUrl: MOCK_COURSE_RUN_URL,
      externalCourseEnrollmentUrl: undefined,
      contentKey: MOCK_COURSE_RUN_KEY,
      course: MOCK_COURSE,
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
      externalCourseEnrollmentUrl: undefined,
      contentKey: MOCK_COURSE_RUN_KEY,
      course: MOCK_COURSE,
    });

    // expected components exists
    expect(getByTestId('navigate-to-courseware')).toBeInTheDocument();
    expect(getByTestId('redemption-status-text')).toBeInTheDocument();

    // verify props passed into children components
    expect(NavigateToCourseware.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        shouldUpgradeUserEnrollment: false,
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
      externalCourseEnrollmentUrl: undefined,
      contentKey: MOCK_COURSE_RUN_KEY,
      course: MOCK_COURSE,
    });

    // expected components exists
    expect(getByTestId('navigate-to-courseware')).toBeInTheDocument();
    expect(getByTestId('redemption-status-text')).toBeInTheDocument();

    // verify props passed into children components
    expect(NavigateToCourseware.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        shouldUpgradeUserEnrollment: false,
        contentKey: MOCK_COURSE_RUN_KEY,
        courseRunUrl: MOCK_COURSE_RUN_URL,
        onUpgradeClick: expect.any(Function),
        onUpgradeSuccess: expect.any(Function),
        onUpgradeError: expect.any(Function),
      }),
    );
  });

  it.each([
    { shouldUpgradeEnrollment: true },
    { shouldUpgradeEnrollment: false },
  ])('returns courseware CTA if user is already enrolled (audit mode) with upgrade (%s)', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: MOCK_REDEEMABLE_SUBSIDY,
    });
    const { getByTestId } = renderUseCourseRunCardActionHook({
      isUserEnrolled: true,
      userEnrollment: MOCK_ENROLLMENT_AUDIT,
      courseRunUrl: MOCK_COURSE_RUN_URL,
      externalCourseEnrollmentUrl: undefined,
      contentKey: MOCK_COURSE_RUN_KEY,
      course: MOCK_COURSE,
    });

    // expected components exists
    expect(getByTestId('navigate-to-courseware')).toBeInTheDocument();
    expect(getByTestId('redemption-status-text')).toBeInTheDocument();

    // verify props passed into children components
    expect(NavigateToCourseware.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        shouldUpgradeUserEnrollment: true,
        contentKey: MOCK_COURSE_RUN_KEY,
        courseRunUrl: MOCK_COURSE_RUN_URL,
        onUpgradeClick: expect.any(Function),
        onUpgradeSuccess: expect.any(Function),
        onUpgradeError: expect.any(Function),
      }),
    );
  });

  it('returns null if user is not yet enrolled and can request a subsidy for the course', () => {
    const { result } = renderUseCourseRunCardActionHook({
      isUserEnrolled: false,
      userCanRequestSubsidyForCourse: true,
      course: MOCK_COURSE,
    });
    expect(result.current).toBeNull();
  });
});
