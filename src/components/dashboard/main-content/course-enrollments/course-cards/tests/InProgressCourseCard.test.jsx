import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseEnrollmentsContext } from '../../CourseEnrollmentsContextProvider';
import { UpgradeableCourseEnrollmentContext } from '../../UpgradeableCourseEnrollmentContextProvider';
import { InProgressCourseCard } from '../InProgressCourseCard';
import { UserSubsidyContext } from '../../../../../enterprise-user-subsidy';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

const basicProps = {
  courseRunStatus: 'in_progress',
  title: 'edX Demonstration Course',
  linkToCourse: 'https://edx.org',
  courseRunId: 'my+course+key',
  notifications: [],
};

const InProgressCourseCardWrapper = ({
  appContextValue =
  {
    enterpriseConfig: {
      uuid: 123,
    },
    authenticatedUser: {
      username: 'test-username',
    },
  },
  userSubsidyContextValue = {
    couponCodes: {
      couponCodes: [],
    },
  },
  courseEnrollmentsContextValue = {
    updateCourseEnrollmentStatus: jest.fn(),
    setShowMarkCourseCompleteSuccess: jest.fn(),
  },
  upgradeableCourseEnrollmentContextValue = {
    isLoading: false,
    licenseUpgradeUrl: undefined,
    couponUpgradeUrl: undefined,
  },
  ...rest
}) => (
  <AppContext.Provider value={appContextValue}>
    <UserSubsidyContext.Provider value={userSubsidyContextValue}>
      <CourseEnrollmentsContext.Provider value={courseEnrollmentsContextValue}>
        <UpgradeableCourseEnrollmentContext.Provider value={upgradeableCourseEnrollmentContextValue}>
          <InProgressCourseCard {...rest} />
        </UpgradeableCourseEnrollmentContext.Provider>
      </CourseEnrollmentsContext.Provider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<InProgressCourseCard />', () => {
  it('should not render upgrade course button if there is no couponUpgradeUrl', () => {
    render(<InProgressCourseCardWrapper {...basicProps} />);
    expect(screen.queryByTestId('upgrade-course-button')).not.toBeInTheDocument();
  });

  it('should render upgrade course button if there is a couponUpgradeUrl', () => {
    render(<InProgressCourseCardWrapper
      {...basicProps}
      upgradeableCourseEnrollmentContextValue={
        {
          isLoading: false,
          licenseUpgradeUrl: undefined,
          couponUpgradeUrl: 'coupon-upgrade-url',
        }
      }
    />);

    expect(screen.getByTestId('upgrade-course-button')).toBeInTheDocument();
  });
});
