import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import * as frontendEnterpriseUtils from '@edx/frontend-enterprise-utils';
import { useMemo } from 'react';

import CourseSection from '../CourseSection';
import { createCourseEnrollmentWithStatus } from './enrollment-testutils';
import { COURSE_MODES, COURSE_STATUSES } from '../../../../../constants';

jest.mock('@edx/frontend-enterprise-utils');
jest.mock('../course-cards', () => ({
  __esModule: true,
  InProgressCourseCard: () => '<InProgressCourseCard />',
  UpcomingCourseCard: () => '<UpcomingCourseCard />',
  CompletedCourseCard: () => '<CompletedCourseCard />',
  SavedForLaterCourseCard: () => '<SavedForLaterCourseCard />',
  RequestedCourseCard: () => '<RequestedCourseCard />',
}));
jest.mock('../UpgradeableCourseEnrollmentContextProvider', () => ({
  __esModule: true,
  UpgradeableCourseEnrollmentContextProvider: () => '<UpgradeableCourseEnrollmentContextProvider />',
}));

const CARD_COMPONENT_BY_COURSE_STATUS = {
  [COURSE_STATUSES.upcoming]: '<UpcomingCourseCard />',
  [COURSE_STATUSES.inProgress]: '<InProgressCourseCard />',
  [COURSE_STATUSES.completed]: '<CompletedCourseCard />',
  [COURSE_STATUSES.savedForLater]: '<SavedForLaterCourseCard />',
  [COURSE_STATUSES.requested]: '<RequestedCourseCard />',
};
const TEST_ENTERPRISE_UUID = 'test-uuid';

const CourseSectionWrapper = (props) => {
  const contextValue = useMemo(() => ({
    enterpriseConfig: {
      uuid: TEST_ENTERPRISE_UUID,
    },
  }), []);
  return (
    <AppContext.Provider value={contextValue}>
      <CourseSection
        {...props}
      />
    </AppContext.Provider>
  );
};

describe('<CourseSection />', () => {
  it('should handle collapsible toggle', () => {
    const title = 'Upcoming';
    const courseRuns = [...Array(3)].map(() => createCourseEnrollmentWithStatus({ status: COURSE_STATUSES.upcoming }));
    render(
      <CourseSectionWrapper
        title={title}
        courseRuns={courseRuns}
      />,
    );

    expect(screen.getByText(title));

    fireEvent.click(screen.getByText(title));

    expect(frontendEnterpriseUtils.sendEnterpriseTrackEvent).toHaveBeenCalled();

    expect(screen.getByText(`${title} (${courseRuns.length})`));
  });

  it.each(
    Object.values(COURSE_STATUSES),
  )('should render the correct course cards', (courseStatus) => {
    render(
      <CourseSectionWrapper
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
      <CourseSectionWrapper
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
