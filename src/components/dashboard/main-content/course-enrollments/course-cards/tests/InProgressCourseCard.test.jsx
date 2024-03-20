import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { Factory } from 'rosie';

import { UpgradeableCourseEnrollmentContext } from '../../UpgradeableCourseEnrollmentContextProvider';
import { InProgressCourseCard } from '../InProgressCourseCard';
import { useCouponCodes, useEnterpriseCustomer } from '../../../../../app/data';
import { queryClient } from '../../../../../../utils/tests';

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
  mode: 'verified',
};

const defaultAppContextValue = {
  authenticatedUser: {
    username: 'test-username',
  },
};

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCouponCodes: jest.fn(),
}));

const InProgressCourseCardWrapper = ({
  appContextValue = defaultAppContextValue,
  upgradeableCourseEnrollmentContextValue = {
    isLoading: false,
    licenseUpgradeUrl: undefined,
    couponUpgradeUrl: undefined,
    courseRunPrice: 100,
  },
  ...rest
}) => (
  <QueryClientProvider client={queryClient()}>
    <AppContext.Provider value={appContextValue}>
      <UpgradeableCourseEnrollmentContext.Provider value={upgradeableCourseEnrollmentContextValue}>
        <InProgressCourseCard {...rest} />
      </UpgradeableCourseEnrollmentContext.Provider>
    </AppContext.Provider>
  </QueryClientProvider>
);

const mockEnterpriseCustomer = Factory.build('enterpriseCustomer');

describe('<InProgressCourseCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [],
      },
    });
  });

  it('should not render upgrade course button if there is no couponUpgradeUrl', () => {
    renderWithRouter(<InProgressCourseCardWrapper {...basicProps} />);
    expect(screen.queryByTestId('upgrade-course-button')).not.toBeInTheDocument();
  });

  it('should render upgrade course button if there is a couponUpgradeUrl', () => {
    renderWithRouter(<InProgressCourseCardWrapper
      {...basicProps}
      upgradeableCourseEnrollmentContextValue={
        {
          isLoading: false,
          licenseUpgradeUrl: undefined,
          couponUpgradeUrl: 'coupon-upgrade-url',
          courseRunPrice: 100,
        }
      }
    />);

    expect(screen.getByTestId('upgrade-course-button')).toBeInTheDocument();
  });
});
