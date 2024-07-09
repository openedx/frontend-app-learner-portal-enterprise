import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { InProgressCourseCard } from '../InProgressCourseCard';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  COURSE_MODES_MAP,
  useCouponCodes,
  useEnterpriseCustomer,
} from '../../../../../app/data';
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
        couponCodeRedemptionCount: 0,
      },
    });
    useCourseUpgradeData.mockReturnValue({
      subsidyForCourse: null,
      courseRunPrice: null,
      hasUpgradeAndConfirm: false,
    });
  });

  it('should not render upgrade course button when hasUpgradeAndConfirm=false', () => {
    renderWithRouter(<InProgressCourseCardWrapper {...baseProps} />);
    expect(screen.queryByTestId('upgrade-course-button')).not.toBeInTheDocument();
  });

  it('should render upgrade course button when hasUpgradeAndConfirm=true', () => {
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [{
          code: 'abc123',
        }],
        couponCodeRedemptionCount: 1,
      },
    });
    useCourseUpgradeData.mockReturnValue({
      courseRunPrice: 100,
      subsidyForCourse: {
        subsidyType: COUPON_CODE_SUBSIDY_TYPE,
        redemptionUrl: 'coupon-upgrade-url',
      },
      hasUpgradeAndConfirm: true,
    });
    renderWithRouter(<InProgressCourseCardWrapper {...baseProps} />);
    expect(screen.getByTestId('upgrade-course-button')).toBeInTheDocument();
  });
});
