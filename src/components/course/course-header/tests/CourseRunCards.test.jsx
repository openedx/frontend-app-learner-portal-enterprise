import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getConfig } from '@edx/frontend-platform';

import { AppContext } from '@edx/frontend-platform/react';
import CourseRunCards from '../CourseRunCards';
import { authenticatedUserFactory } from '../../../app/data/services/data/__factories__';
import {
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomerContainsContent,
  useUserEntitlements,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
} from '../../../app/data';
import { useUserSubsidyApplicableToCourse } from '../../data';
import { renderWithRouterProvider } from '../../../../utils/tests';
import { ENTERPRISE_RESTRICTION_TYPE } from '../../../../constants';

jest.mock('../CourseRunCard', () => jest.fn((props) => {
  const MockName = 'course-run-card';
  return <MockName data-testid={MockName} {...props} />;
}));
jest.mock('../deprecated/CourseRunCard', () => jest.fn((props) => {
  const MockName = 'deprecated-course-run-card';
  return <MockName data-testid={MockName} {...props} />;
}));

jest.mock('@edx/frontend-platform', () => ({
  ensureConfig: jest.fn(),
  getConfig: jest.fn(),
}));
jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useCourseMetadata: jest.fn(),
  useEnterpriseCustomerContainsContent: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useUserEntitlements: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useUserSubsidyApplicableToCourse: jest.fn(),
}));

const mockCourseRunKey = 'course-run-key';
const mockCourseRunMetadata = {
  start: '2023-05-23T10:00:00Z',
  end: '2050-02-01T10:00:00Z',
  status: 'published',
  isEnrollable: true,
  isMarketable: true,
  availability: 'Current',
  key: mockCourseRunKey,
  uuid: `${mockCourseRunKey}-uuid`,
  title: 'Introduction to Computer Science',
  restrictionType: null,
};
const mockRestrictedCourseRunKey = 'course-run-key-restricted';
const mockRestrictedCourseRunMetadata = {
  ...mockCourseRunMetadata,
  key: mockRestrictedCourseRunKey,
  uuid: `${mockRestrictedCourseRunKey}-uuid`,
  title: 'Introduction to Computer Science (Restricted)',
  restrictionType: ENTERPRISE_RESTRICTION_TYPE,
};

const mockAuthenticatedUser = authenticatedUserFactory();

const CourseRunCardsWrapper = () => (
  <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
    <CourseRunCards />
  </AppContext.Provider>
);

describe('<CourseRunCardStatus />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: {},
      missingUserSubsidyReason: undefined,
    });
    useCourseMetadata.mockReturnValue({ data: { availableCourseRuns: [mockCourseRunKey] } });
    useEnterpriseCustomerContainsContent.mockReturnValue({ data: { catalogList: [] } });
    useEnterpriseCourseEnrollments.mockReturnValue({ data: { enterpriseCourseEnrollments: {} } });
    useUserEntitlements.mockReturnValue({ data: {} });
    getConfig.mockReturnValue({
      FEATURE_ENABLE_RESTRICTED_RUNS: true,
    });
  });
  it('renders deprecated course run card when there is no applicable subsidy', () => {
    renderWithRouterProvider(<CourseRunCardsWrapper />);
    expect(screen.getByTestId('deprecated-course-run-card')).toBeInTheDocument();
    expect(screen.queryByTestId('course-run-card')).not.toBeInTheDocument();
  });

  it('renders deprecated course run card when applicable subsidy is other than a policy', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
      missingUserSubsidyReason: undefined,
    });
    renderWithRouterProvider(<CourseRunCardsWrapper />);

    expect(screen.getByTestId('deprecated-course-run-card')).toBeInTheDocument();
    expect(screen.queryByTestId('course-run-card')).not.toBeInTheDocument();
  });

  it('renders non-deprecated course run card with an applicable policy', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: { subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE },
      missingUserSubsidyReason: undefined,
    });
    renderWithRouterProvider(<CourseRunCardsWrapper />);

    expect(screen.getByTestId('course-run-card')).toBeInTheDocument();
    expect(screen.queryByTestId('deprecated-course-run-card')).not.toBeInTheDocument();
  });

  it('renders non-deprecated course run card with a disabled enroll reason', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: {},
      missingUserSubsidyReason: { userMessage: 'You cannot enroll in this course.' },
    });
    renderWithRouterProvider(<CourseRunCardsWrapper />);

    expect(screen.getByTestId('course-run-card')).toBeInTheDocument();
    expect(screen.queryByTestId('deprecated-course-run-card')).not.toBeInTheDocument();
  });

  it('renders non-deprecated course run card with an applicable policy', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: { subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE },
      missingUserSubsidyReason: undefined,
    });
    renderWithRouterProvider(<CourseRunCardsWrapper />);

    expect(screen.getByTestId('course-run-card')).toBeInTheDocument();
    expect(screen.queryByTestId('deprecated-course-run-card')).not.toBeInTheDocument();
  });

  it('renders course run card for a restricted run', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: {
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
        // This override list should bypass the logic which skips restricted runs.
        availableCourseRuns: [
          mockCourseRunMetadata,
          mockRestrictedCourseRunMetadata,
        ],
      },
      missingUserSubsidyReason: undefined,
    });
    useCourseMetadata.mockReturnValue({
      data: {
        courseRuns: [
          mockCourseRunMetadata,
          mockRestrictedCourseRunMetadata,
        ],
        availableCourseRuns: [
          mockCourseRunMetadata,
          mockRestrictedCourseRunMetadata,
        ],
      },
    });

    renderWithRouterProvider(<CourseRunCardsWrapper />);

    const [firstCard, secondCard] = screen.getAllByTestId('course-run-card');
    expect(firstCard).not.toHaveTextContent('Restricted');
    expect(secondCard).not.toHaveTextContent('Restricted');
    expect(screen.queryByTestId('deprecated-course-run-card')).not.toBeInTheDocument();
  });

  it('does not render course run card for a restricted run that the policy cannot redeem.', () => {
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: {
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
        // This override list should bypass the logic which skips restricted runs.
        availableCourseRuns: [
          mockCourseRunMetadata,
          // Do not include the restricted run in the list of runs available to
          // the LC subsidy. This simulates calls to can-redeem rejecting this
          // restricted run.
          //
          // mockRestrictedCourseRunMetadata,
        ],
      },
      missingUserSubsidyReason: undefined,
    });
    useCourseMetadata.mockReturnValue({
      data: {
        courseRuns: [
          mockCourseRunMetadata,
          mockRestrictedCourseRunMetadata,
        ],
        availableCourseRuns: [
          mockCourseRunMetadata,
          // The restricted run is "available" according to useCourseMetadata
          // which is itself unaware of subsidy types. This is normal and
          // expected, and the useUserSubsidyApplicableToCourse hook really has
          // the final say about which runs to display.
          mockRestrictedCourseRunMetadata,
        ],
      },
    });

    renderWithRouterProvider(<CourseRunCardsWrapper />);

    expect(screen.getByTestId('course-run-card')).not.toHaveTextContent('Restricted');
    expect(screen.queryByTestId('deprecated-course-run-card')).not.toBeInTheDocument();
  });
});
