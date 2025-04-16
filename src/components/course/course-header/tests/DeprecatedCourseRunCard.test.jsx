import dayjs from 'dayjs';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { renderWithRouter } from '../../../../utils/tests';
import { COURSE_PACING_MAP } from '../../data/constants';
import CourseRunCardDeprecated from '../deprecated/CourseRunCard';
import { enrollButtonTypes } from '../../enrollment/constants';
import {
  COURSE_AVAILABILITY_MAP,
  COURSE_MODES_MAP,
  useBrowseAndRequest,
  useCouponCodes,
  useCourseMetadata,
  useCourseRedemptionEligibility,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContent,
  useEnterpriseOffers,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';
import { useCanUserRequestSubsidyForCourse } from '../../data/hooks';
import { SUBSIDY_TYPE } from '../../../../constants';

const COURSE_UUID = 'foo';
const COURSE_RUN_START = dayjs().toISOString();
const COURSE_WEEKS_TO_COMPLETE = 1;
const DATE_FORMAT = 'MMM D';
const COURSE_ID = '123';

jest.mock('../../../../config');

jest.mock('../../enrollment/EnrollAction', () => function EnrollAction({ enrollLabel, enrollmentType }) {
  return (
    <>
      <span>{enrollLabel}</span>
      <span>{enrollmentType}</span>
    </>
  );
});
jest.mock('../../data/hooks', () => ({
  useCanUserRequestSubsidyForCourse: jest.fn(),
  useUserHasSubsidyRequestForCourse: jest.fn(),
  useCourseEnrollmentUrl: jest.fn(),
  useCoursePriceForUserSubsidy: jest.fn(),
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCourseMetadata: jest.fn(),
  useSubscriptions: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useCourseRedemptionEligibility: jest.fn(),
  useEnterpriseCustomerContainsContent: jest.fn(),
  useEnterpriseOffers: jest.fn(),
  useCouponCodes: jest.fn(),
  useBrowseAndRequest: jest.fn(),
}));
jest.mock('../../data/hooks', () => ({
  ...jest.requireActual('../../data/hooks'),
  useCanUserRequestSubsidyForCourse: jest.fn(),
}));

const INITIAL_APP_STATE = { authenticatedUser: authenticatedUserFactory() };

const generateCourseRun = ({
  availability = COURSE_AVAILABILITY_MAP.STARTING_SOON,
  pacingType = COURSE_PACING_MAP.SELF_PACED,
  enrollmentCount = 0,
  isEnrollable = true,
  start = COURSE_RUN_START,
}) => ({
  availability,
  pacingType,
  enrollmentCount,
  isEnrollable,
  start,
  end: dayjs().add(COURSE_WEEKS_TO_COMPLETE + 1, 'weeks').format(),
  key: COURSE_ID,
  seats: [{ sku: 'sku', type: COURSE_MODES_MAP.VERIFIED }],
  courseUuid: COURSE_UUID,
  weeksToComplete: COURSE_WEEKS_TO_COMPLETE,
});

const renderCard = ({
  courseRun,
  userEntitlements = [],
  courseEntitlements = [],
  userEnrollments = [],
}) => {
  // need to use router, to render component such as react-router's <Link>
  renderWithRouter(
    <IntlProvider locale="en">
      <AppContext.Provider value={INITIAL_APP_STATE}>
        <CourseRunCardDeprecated
          catalogList={['foo']}
          userEntitlements={userEntitlements}
          userEnrollments={userEnrollments}
          courseRun={courseRun}
          courseKey={COURSE_ID}
          courseEntitlements={courseEntitlements}
        />
      </AppContext.Provider>,
    </IntlProvider>,
  );
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<DeprecatedCourseRunCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCourseMetadata.mockReturnValue({ data: { test: false } });
    useCanUserRequestSubsidyForCourse.mockReturnValue(false);
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: undefined,
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
      },
    });
    useRedeemablePolicies.mockReturnValue({
      data: {
        redeemablePolicies: [],
      },
    });
    useCourseRedemptionEligibility.mockReturnValue({ data: { listPrice: 100 } });
    useEnterpriseCustomerContainsContent.mockReturnValue({
      data: {
        containsContentItems: false,
        catalogList: [],
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [],
        currentEnterpriseOffers: [],
        canEnrollWithEnterpriseOffers: false,
      },
    });
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [],
      },
    });
    useBrowseAndRequest.mockReturnValue({
      data: {
        configuration: undefined,
        requests: {
          subscriptionLicenses: [],
          couponCodes: [],
        },
      },
    });
  });

  test('Course archived card', () => {
    renderCard({
      courseRun: generateCourseRun({ availability: COURSE_AVAILABILITY_MAP.ARCHIVED }),
    });
    expect(screen.getByText('Course archived')).toBeInTheDocument();
    expect(screen.getByText('Future dates to be announced')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).not.toBeInTheDocument();
  });

  test('Course not enrollable, coming soon', () => {
    renderCard({ courseRun: generateCourseRun({ isEnrollable: false }) });
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).toBeInTheDocument();
  });

  test('Course not enrollable and no availability', () => {
    const courseRun = generateCourseRun({
      isEnrollable: false,
      availability: '',
    });
    renderCard({ courseRun });
    expect(screen.getByText('Enrollment closed')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).toBeInTheDocument();
  });

  test('User has entitlement', () => {
    const courseRun = generateCourseRun({});
    renderCard({
      courseRun,
      userEntitlements: [{ courseUuid: COURSE_UUID }],
    });
    expect(screen.getByText('Entitlement found')).toBeInTheDocument();
    expect(screen.getByText('View on dashboard')).toBeInTheDocument();
  });

  test('Course is self paced and has started', () => {
    // If Browse/Request feature is off, user should always see the enroll button
    const courseRun = generateCourseRun({});
    renderCard({ courseRun });
    const startDate = dayjs(COURSE_RUN_START).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('Be the first to enroll!')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).toBeInTheDocument();
  });

  test('Course self is paced, has not started, and enrollment count', () => {
    // The user has a mocked subsidy from renderCard default values,
    // so they should see an enroll button.
    const courseRunStart = dayjs(COURSE_RUN_START).add(1, 'd').toISOString();
    const courseRun = generateCourseRun({
      start: courseRunStart,
      enrollmentCount: 1000,
    });
    renderCard({ courseRun });
    const startDate = dayjs(courseRunStart).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('1,000 recently enrolled!')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).toBeInTheDocument();
  });

  test('User has a subsidy request for the course', () => {
    useBrowseAndRequest.mockReturnValue({
      data: {
        configuration: {
          subsidyType: SUBSIDY_TYPE.LICENSE,
          subsidyRequestsEnabled: true,
        },
        requests: {
          subscriptionLicenses: ['test-license'],
        },
      },
    });
    const courseRun = generateCourseRun({});
    renderCard({ courseRun });
    const startDate = dayjs(COURSE_RUN_START).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('Be the first to enroll!')).toBeInTheDocument();
    expect(screen.getByText(enrollButtonTypes.HIDE_BUTTON)).toBeInTheDocument();
  });

  test('User must request enrollment', () => {
    // The user should only see a Request Enrollment button if they have no assigned subsidies
    // and there is an applicable catalog for the configured subsidy request type.
    const courseRun = generateCourseRun({});
    useCanUserRequestSubsidyForCourse.mockReturnValue(true);
    renderCard({ courseRun });
    const startDate = dayjs(COURSE_RUN_START).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('Be the first to enroll!')).toBeInTheDocument();
    expect(screen.getByText(enrollButtonTypes.HIDE_BUTTON)).toBeInTheDocument();
  });

  test('User must request enrollment, but course is not applicable to catalogs for configured subsidy type', () => {
    // The user should NOT see a Request Enrollment button if they have no assigned
    // subsidies and there is no applicable catalog for the configured subsidy type.
    // Instead, the CTA should bring the user through the ecommerce basket flow.
    const courseRun = generateCourseRun({});
    renderCard({ courseRun });
    const startDate = dayjs(COURSE_RUN_START).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('Be the first to enroll!')).toBeInTheDocument();
    expect(screen.getByText(enrollButtonTypes.ENROLL_DISABLED)).toBeInTheDocument();
  });

  test('User is enrolled, and course not started', () => {
    const courseRunStart = dayjs(COURSE_RUN_START).add(1, 'd').toISOString();
    const courseRun = generateCourseRun({
      start: courseRunStart,
    });
    const startDate = dayjs(courseRunStart).format(DATE_FORMAT);
    renderCard({
      courseRun,
      userEnrollments: [{
        courseRunId: COURSE_ID,
        isEnrollmentActive: true,
        isRevoked: false,
        mode: COURSE_MODES_MAP.VERIFIED,
      }],
    });
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('You are enrolled')).toBeInTheDocument();
    expect(screen.getByText('View course')).toBeInTheDocument();
  });
});
