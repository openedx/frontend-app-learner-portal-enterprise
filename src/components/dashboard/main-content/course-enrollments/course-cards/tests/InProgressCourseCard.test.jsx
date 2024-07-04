import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { InProgressCourseCard } from '../InProgressCourseCard';
import { COURSE_MODES_MAP, useCouponCodes, useEnterpriseCustomer } from '../../../../../app/data';
import { queryClient } from '../../../../../../utils/tests';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../../../app/data/services/data/__factories__';
import { useCourseUpgradeData } from '../../data';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useCourseUpgradeData: jest.fn(),
}));

const baseProps = {
  courseRunStatus: 'in_progress',
  title: 'edX Demonstration Course',
  linkToCourse: 'https://edx.org',
  courseRunId: 'my+course+key',
  notifications: [],
  mode: COURSE_MODES_MAP.VERIFIED,
};

const mockAuthenticatedUser = authenticatedUserFactory();
const defaultAppContextValue = {
  authenticatedUser: mockAuthenticatedUser,
};

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCouponCodes: jest.fn(),
}));

const InProgressCourseCardWrapper = ({
  appContextValue = defaultAppContextValue,
  ...rest
}) => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en">
      <AppContext.Provider value={appContextValue}>
        <InProgressCourseCard {...rest} />
      </AppContext.Provider>
    </IntlProvider>
  </QueryClientProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<InProgressCourseCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [],
      },
    });
    useCourseUpgradeData.mockReturnValue({
      licenseUpgradeUrl: undefined,
      couponUpgradeUrl: undefined,
      learnerCreditUpgradeUrl: undefined,
      subsidyForCourse: undefined,
      courseRunPrice: undefined,
    });
  });

  it('should not render upgrade course button if there is no couponUpgradeUrl', () => {
    renderWithRouter(<InProgressCourseCardWrapper {...baseProps} />);
    expect(screen.queryByTestId('upgrade-course-button')).not.toBeInTheDocument();
  });

  it('should render upgrade course button if there is a couponUpgradeUrl', () => {
    useCourseUpgradeData.mockReturnValue({
      licenseUpgradeUrl: undefined,
      couponUpgradeUrl: 'coupon-upgrade-url',
      courseRunPrice: 100,
      learnerCreditUpgradeUrl: undefined,
      subsidyForCourse: undefined,
    });
    renderWithRouter(<InProgressCourseCardWrapper
      {...baseProps}
      upgradeableCourseEnrollmentContextValue={
        {
          couponUpgradeUrl: 'coupon-upgrade-url',
          courseRunPrice: 100,
        }
      }
    />);

    expect(screen.getByTestId('upgrade-course-button')).toBeInTheDocument();
  });
});
