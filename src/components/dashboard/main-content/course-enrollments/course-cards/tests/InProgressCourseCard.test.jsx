import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { InProgressCourseCard } from '../InProgressCourseCard';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  COURSE_MODES_MAP,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
  useCouponCodes,
  useEnterpriseCustomer,
  useIsBFFEnabled,
} from '../../../../../app/data';
import { queryClient } from '../../../../../../utils/tests';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../../../app/data/services/data/__factories__';
import { useCourseUpgradeData } from '../../data';
import { messages } from '../../../../../course/EnrollModal';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useCourseUpgradeData: jest.fn(),
}));

const baseProps = {
  courseRunStatus: 'in_progress',
  title: 'edX Demonstration Course',
  linkToCourse: 'https://edx.org',
  courseRunId: 'my+course+key',
  notifications: [],
  mode: COURSE_MODES_MAP.VERIFIED,
};

const mockAuthenticatedUser = authenticatedUserFactory();
const defaultAppContextValue = {
  authenticatedUser: mockAuthenticatedUser,
};

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCouponCodes: jest.fn(),
  useIsBFFEnabled: jest.fn(),
}));

const InProgressCourseCardWrapper = ({
  appContextValue = defaultAppContextValue,
  ...rest
}) => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en">
      <AppContext.Provider value={appContextValue}>
        <InProgressCourseCard {...rest} />
      </AppContext.Provider>
    </IntlProvider>
  </QueryClientProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const mockRedeem = jest.fn();

describe('<InProgressCourseCard />', () => {
  const realLocation = global.location;

  beforeAll(() => {
    delete global.location;
    global.location = { ...realLocation, assign: jest.fn() };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useIsBFFEnabled.mockReturnValue(false);
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCourseUpgradeData.mockReturnValue({
      subsidyForCourse: null,
      courseRunPrice: null,
      hasUpgradeAndConfirm: false,
      redeem: mockRedeem,
    });
  });

  afterAll(() => {
    global.location = realLocation;
  });

  it('should not render upgrade course button when hasUpgradeAndConfirm=false (no subsidy returned)', () => {
    renderWithRouter(<InProgressCourseCardWrapper {...baseProps} />);
    expect(screen.queryByTestId('upgrade-course-button')).not.toBeInTheDocument();
  });

  it('should not render upgrade course button when hasUpgradeAndConfirm=false (subscription license)', () => {
    useCourseUpgradeData.mockReturnValue({
      courseRunPrice: null,
      subsidyForCourse: {
        subsidyType: LICENSE_SUBSIDY_TYPE,
        redemptionUrl: 'https://redemption.url',
      },
      hasUpgradeAndConfirm: false,
      redeem: mockRedeem,
    });
    renderWithRouter(<InProgressCourseCardWrapper {...baseProps} />);
    expect(screen.queryByTestId('upgrade-course-button')).not.toBeInTheDocument();
  });

  it('should render upgrade course button when hasUpgradeAndConfirm=true (coupon codes)', () => {
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [{
          code: 'abc123',
        }],
        couponCodeRedemptionCount: 1,
      },
    });
    useCourseUpgradeData.mockReturnValue({
      courseRunPrice: 100,
      subsidyForCourse: {
        subsidyType: COUPON_CODE_SUBSIDY_TYPE,
        redemptionUrl: 'https://redemption.url',
      },
      hasUpgradeAndConfirm: true,
      redeem: mockRedeem,
    });
    renderWithRouter(<InProgressCourseCardWrapper {...baseProps} />);
    expect(screen.getByTestId('upgrade-course-button')).toBeInTheDocument();
  });

  it.each([
    { shouldAttemptRedemption: true },
    { shouldAttemptRedemption: false }, // dismisses the modal
  ])('should render upgrade course button when hasUpgradeAndConfirm=true (learner credit) | (%s)', async ({ shouldAttemptRedemption }) => {
    useCourseUpgradeData.mockReturnValue({
      courseRunPrice: 100,
      subsidyForCourse: {
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
        redemptionUrl: 'https://redemption.url',
      },
      hasUpgradeAndConfirm: true,
      redeem: mockRedeem,
    });
    renderWithRouter(<InProgressCourseCardWrapper {...baseProps} />);

    const useCourseUpgradeDataArgs = useCourseUpgradeData.mock.calls[1][0];
    expect(useCourseUpgradeDataArgs).toEqual(
      expect.objectContaining({
        onRedeem: expect.any(Function),
        onRedeemSuccess: expect.any(Function),
        onRedeemError: expect.any(Function),
      }),
    );

    // Open upgrade confirmation modal
    const upgradeCTA = screen.getByTestId('upgrade-course-button');
    expect(upgradeCTA).toBeInTheDocument();
    userEvent.click(upgradeCTA);

    // Verify upgrade confirmation modal is open
    expect(screen.getByText(messages.learnerCreditModalTitle.defaultMessage, { selector: 'h2' })).toBeInTheDocument();

    if (shouldAttemptRedemption) {
      // Proceed with upgrade confirmation
      const upgradeModalCTA = screen.getByRole('button', { name: messages.upgradeModalConfirmCta.defaultMessage });
      userEvent.click(upgradeModalCTA);
      expect(mockRedeem).toHaveBeenCalledTimes(1);

      // Verify `onRedeem` sets confirmation CTA as pending & sends analytics event
      act((() => {
        useCourseUpgradeDataArgs.onRedeem();
      }));
      expect(screen.getByRole('button', { name: messages.upgradeModalConfirmCtaPending.defaultMessage })).toBeInTheDocument();
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        mockEnterpriseCustomer.uuid,
        'edx.ui.enterprise.learner_portal.dashboard.course.upgrade_button.confirmed',
      );

      // Verify `onRedeemSuccess` sets confirmation CTA as complete & redirects to courseware URL
      const mockTransaction = { state: 'committed', coursewareUrl: 'https://courseware.url' };
      act((() => {
        useCourseUpgradeDataArgs.onRedeemSuccess(mockTransaction);
      }));
      expect(screen.getByRole('button', { name: messages.upgradeModalConfirmCtaComplete.defaultMessage })).toBeInTheDocument();
      expect(global.location.assign).toHaveBeenCalledWith(mockTransaction.coursewareUrl);

      const mockErroredTransaction = { state: 'errored', coursewareUrl: 'https://did.not.visit' };
      act((() => {
        useCourseUpgradeDataArgs.onRedeemSuccess(mockErroredTransaction);
      }));
      expect(global.location.assign).not.toHaveBeenCalledWith(mockErroredTransaction.coursewareUrl);

      // Verify `onRedeemError` sets confirmation CTA as error
      act((() => {
        useCourseUpgradeDataArgs.onRedeemError();
      }));
      expect(screen.getByRole('button', { name: messages.upgradeModalConfirmCtaError.defaultMessage })).toBeInTheDocument();
    } else {
      // Dismiss upgrade confirmation modal
      const cancelModalCTA = screen.getByRole('button', { name: messages.modalCancelCta.defaultMessage });
      userEvent.click(cancelModalCTA);

      // Verify upgrade confirmation modal is no longer open
      expect(screen.queryByText(messages.learnerCreditModalTitle.defaultMessage, { selector: 'h2' })).not.toBeInTheDocument();
    }
  });
});
