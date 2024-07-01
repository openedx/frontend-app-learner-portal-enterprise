import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

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

jest.mock('../CourseRunCard', () => jest.fn((props) => {
  const MockName = 'course-run-card';
  return <MockName data-testid={MockName} {...props} />;
}));
jest.mock('../deprecated/CourseRunCard', () => jest.fn((props) => {
  const MockName = 'deprecated-course-run-card';
  return <MockName data-testid={MockName} {...props} />;
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
});
