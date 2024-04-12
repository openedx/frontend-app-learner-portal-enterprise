import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import CourseRunCard from '../CourseRunCard';
import { CourseContext } from '../../CourseContextProvider';
import { useCourseRunCardData } from '../data';
import { findUserEnrollmentForCourseRun } from '../../data/utils';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';
import {
  useCouponCodes,
  useCourseMetadata,
  useCourseRedemptionEligibility,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContent,
  useEnterpriseOffers,
  useSubscriptions,
} from '../../../app/data';
import {
  LEARNER_CREDIT_SUBSIDY_TYPE,
  useCanUserRequestSubsidyForCourse,
  useUserSubsidyApplicableToCourse,
} from '../../data';
import { queryClient, renderWithRouterProvider } from '../../../../utils/tests';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCourseMetadata: jest.fn(),
  useSubscriptions: jest.fn(),
  useEnterpriseOffers: jest.fn(),
  useEnterpriseCustomerContainsContent: jest.fn(),
  useCouponCodes: jest.fn(),
  useCourseRedemptionEligibility: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useCanUserRequestSubsidyForCourse: jest.fn(),
  useUserSubsidyApplicableToCourse: jest.fn(),
  useCourseListPrice: jest.fn(),
}));

jest.mock('../../data/utils', () => ({
  ...jest.requireActual('../../data/utils'),
  findUserEnrollmentForCourseRun: jest.fn(),
}));

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useCourseRunCardData: jest.fn().mockReturnValue({
    heading: 'Heading',
    subHeading: 'Subheading',
    action: 'Action',
  }),
}));
const mockCourseRunKey = 'course-v1:edX+DemoX+Demo_Course';
const mockCourseRunUrl = 'http://course.url';
const mockUserEnrollment = {
  id: 1,
  isEnrollmentActive: true,
  isRevoked: false,
  courseRunId: mockCourseRunKey,
  courseRunUrl: mockCourseRunUrl,
  linkToCourse: mockCourseRunUrl,
};
const mockCourseRun = {
  key: mockCourseRunKey,
  availability: 'Current',
  start: '2020-01-01T00:00:00Z',
  pacingType: 'self_paced',
  enrollmentCount: 0,
  linkToCourse: mockCourseRunUrl,
};

const mockUserSubsidy = { subsidyType: 'learnerCredit' };
const mockUserEnrollments = [mockUserEnrollment];
const mockUserCanRequestSubsidy = false;
const mockAuthenticatedUser = authenticatedUserFactory();
const CourseRunCardWrapper = (props) => {
  const courseContextValue = {
    state: {
      course: {
        entitlements: [],
      },
      userEnrollments: mockUserEnrollments,
    },
    userSubsidyApplicableToCourse: mockUserSubsidy,
    userCanRequestSubsidyForCourse: mockUserCanRequestSubsidy,
  };
  return (
    <QueryClientProvider client={queryClient()}>
      <CourseContext.Provider value={courseContextValue}>
        <AppContext.Provider value={mockAuthenticatedUser}>
          <CourseRunCard
            courseRun={mockCourseRun}
            {...props}
          />
        </AppContext.Provider>
      </CourseContext.Provider>
    </QueryClientProvider>
  );
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<CourseRunCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({
      data: mockEnterpriseCustomer,
    });
    useCourseMetadata.mockReturnValue({ data: { entitlements: [] } });
    useCourseRedemptionEligibility.mockReturnValue({ data: { listPrice: 199 } });
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: undefined,
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
    });
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
    useEnterpriseCourseEnrollments.mockReturnValue({ data: { enterpriseCourseEnrollments: mockUserEnrollment } });
    useUserSubsidyApplicableToCourse.mockReturnValue({
      userSubsidyApplicableToCourse: {
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
      },
      missingUserSubsidyReason: undefined,
    });
    useCanUserRequestSubsidyForCourse.mockReturnValue(false);
  });
  test('renders', () => {
    findUserEnrollmentForCourseRun.mockReturnValue(mockUserEnrollment);
    renderWithRouterProvider(<CourseRunCardWrapper />);
    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByText('Subheading')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();

    expect(useCourseRunCardData).toHaveBeenCalledWith({
      course: { entitlements: [] },
      courseRun: mockCourseRun,
      courseRunUrl: mockUserEnrollment.courseRunUrl,
      userEnrollment: mockUserEnrollment,
      subsidyAccessPolicy: mockUserSubsidy,
      userCanRequestSubsidyForCourse: mockUserCanRequestSubsidy,
    });
  });
});
