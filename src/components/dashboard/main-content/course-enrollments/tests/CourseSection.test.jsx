import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import * as frontendEnterpriseUtils from '@edx/frontend-enterprise-utils';

import userEvent from '@testing-library/user-event';
import CourseSection from '../CourseSection';
import { createCourseEnrollmentWithStatus } from './enrollment-testutils';
import { COURSE_MODES, COURSE_STATUSES } from '../../../../../constants';
import { useEnterpriseCustomer } from '../../../../app/data';
import { enterpriseCustomerFactory } from '../../../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-enterprise-utils');
jest.mock('../course-cards', () => ({
  __esModule: true,
  InProgressCourseCard: () => '<InProgressCourseCard />',
  UpcomingCourseCard: () => '<UpcomingCourseCard />',
  CompletedCourseCard: () => '<CompletedCourseCard />',
  SavedForLaterCourseCard: () => '<SavedForLaterCourseCard />',
  RequestedCourseCard: () => '<RequestedCourseCard />',
  AssignedCourseCard: () => '<AssignedCourseCard />',
}));
jest.mock('../UpgradeableCourseEnrollmentContextProvider', () => ({
  __esModule: true,
  UpgradeableCourseEnrollmentContextProvider: () => '<UpgradeableCourseEnrollmentContextProvider />',
}));

jest.mock('../../../../app/data', () => ({
  ...jest.requireActual('../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const CARD_COMPONENT_BY_COURSE_STATUS = {
  [COURSE_STATUSES.upcoming]: '<UpcomingCourseCard />',
  [COURSE_STATUSES.inProgress]: '<InProgressCourseCard />',
  [COURSE_STATUSES.completed]: '<CompletedCourseCard />',
  [COURSE_STATUSES.savedForLater]: '<SavedForLaterCourseCard />',
  [COURSE_STATUSES.requested]: '<RequestedCourseCard />',
  [COURSE_STATUSES.assigned]: '<AssignedCourseCard />',
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<CourseSection />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  it('should handle collapsible toggle', () => {
    const title = 'Upcoming';
    const courseRuns = [...Array(3)].map(() => createCourseEnrollmentWithStatus({ status: COURSE_STATUSES.upcoming }));
    render(
      <CourseSection
        title={title}
        courseRuns={courseRuns}
      />,
    );

    expect(screen.getByText(title));

    userEvent.click(screen.getByText(title));

    expect(frontendEnterpriseUtils.sendEnterpriseTrackEvent).toHaveBeenCalled();

    expect(screen.getByText(`${title} (${courseRuns.length})`));
  });

  it.each(
    Object.values(COURSE_STATUSES),
  )('should render the correct course cards', (courseStatus) => {
    render(
      <CourseSection
        title="title"
        courseRuns={[
          createCourseEnrollmentWithStatus({ status: courseStatus }),
        ]}
      />,
    );

    expect(screen.getByText(CARD_COMPONENT_BY_COURSE_STATUS[courseStatus]));
  });

  it.each([
    {
      status: COURSE_STATUSES.inProgress,
      mode: COURSE_MODES.AUDIT,
      isUpgradeable: true,
    },
    {
      status: COURSE_STATUSES.completed,
      mode: COURSE_MODES.AUDIT,
      isUpgradeable: false,
    },
    {
      status: COURSE_STATUSES.inProgress,
      mode: COURSE_MODES.VERIFIED,
      isUpgradeable: false,
    },
  ])('should wrap Card with <UpgradeableCourseEnrollmentContextProvider /> if course is in progress and in audit mode', ({
    status, mode, isUpgradeable,
  }) => {
    render(
      <CourseSection
        title="title"
        courseRuns={[
          createCourseEnrollmentWithStatus({ status, mode }),
        ]}
      />,
    );

    const wrapper = screen.queryByText('<UpgradeableCourseEnrollmentContextProvider />');
    if (isUpgradeable) {
      expect(wrapper).toBeInTheDocument();
    } else {
      expect(wrapper).not.toBeInTheDocument();
    }
  });
});
