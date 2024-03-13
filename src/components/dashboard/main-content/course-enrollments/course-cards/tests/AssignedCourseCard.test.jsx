import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CourseEnrollmentsContext } from '../../CourseEnrollmentsContextProvider';
import AssignedCourseCard from '../AssignedCourseCard';
import { UserSubsidyContext } from '../../../../../enterprise-user-subsidy';
import { renderWithRouter } from '../../../../../../utils/tests';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn().mockReturnValue({ data: { uuid: 123 } }),
}));

const basicProps = {
  title: 'edX Demonstration Course',
  linkToCourse: 'https://edx.org',
  courseRunStatus: 'upcoming',
  courseRunId: 'my+course+key',
  courseKey: 'my+course+key',
  notifications: [],
  mode: 'executive-education',
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
  userSubsidyContextValue = initialUserSubsidyContextValue,
  courseEnrollmentsContextValue = initialCourseEnrollmentsContextValue,
  ...rest
}) => (
  <UserSubsidyContext.Provider value={userSubsidyContextValue}>
    <CourseEnrollmentsContext.Provider value={courseEnrollmentsContextValue}>
      <AssignedCourseCard {...rest} />
    </CourseEnrollmentsContext.Provider>
  </UserSubsidyContext.Provider>
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
