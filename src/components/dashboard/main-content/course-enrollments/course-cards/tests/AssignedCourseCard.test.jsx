import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseEnrollmentsContext } from '../../CourseEnrollmentsContextProvider';
import AssignedCourseCard from '../AssignedCourseCard';
import { UserSubsidyContext } from '../../../../../enterprise-user-subsidy';
import { renderWithRouter } from '../../../../../../utils/tests';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

const basicProps = {
  title: 'edX Demonstration Course',
  linkToCourse: 'https://edx.org',
  courseStatus: 'upcoming',
  courseRunId: 'my+course+key',
  courseKey: 'my+course+key',
  notifications: [],
  mode: 'executive-education',
};
const initialAppContextValueState = {
  enterpriseConfig: {
    uuid: 123,
  },
};

const initialUserSubsidyContextValue = {
  couponCodes: {
    couponCodes: [],
  },
};

const initialCourseEnrollmentsContextValue = {
  updateCourseEnrollmentStatus: jest.fn(),
  setShowMarkCourseCompleteSuccess: jest.fn(),
};
const AssignedCourseCardWrapper = ({
  appContextValue = initialAppContextValueState,
  userSubsidyContextValue = initialUserSubsidyContextValue,
  courseEnrollmentsContextValue = initialCourseEnrollmentsContextValue,
  ...rest
}) => (
  <AppContext.Provider value={appContextValue}>
    <UserSubsidyContext.Provider value={userSubsidyContextValue}>
      <CourseEnrollmentsContext.Provider value={courseEnrollmentsContextValue}>
        <AssignedCourseCard {...rest} />
      </CourseEnrollmentsContext.Provider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<AssignedCourseCard />', () => {
  it('should render enroll button and other related content', () => {
    renderWithRouter(<AssignedCourseCardWrapper
      {...basicProps}
      upgradeableCourseEnrollmentContextValue={
        {
          isLoading: false,
          licenseUpgradeUrl: undefined,
          couponUpgradeUrl: 'coupon-upgrade-url',
        }
      }
    />);

    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Enroll')).toBeInTheDocument();
  });
});
