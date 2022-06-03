import React from 'react';
import PropTypes from 'prop-types';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';

import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { CourseContextProvider } from '../CourseContextProvider';
import {
  CourseEnrollmentsContext,
} from '../../dashboard/main-content/course-enrollments/CourseEnrollmentsContextProvider';
import EnrollModal, { modalText } from '../EnrollModal';

const baseCourseInitialState = {
  activeCourseRun: {
    key: 'test-course-run-key',
  },
  algoliaSearchParams: {
    queryId: undefined,
    objectId: undefined,
  },
  catalog: { catalogList: [] },
  course: {},
  userEnrollments: [],
  userEntitlements: [],
  courseRecommendations: {},
};

const baseSubsidyRequestContextValue = {
  catalogsForSubsidyRequests: [],
};

const baseCourseEnrollmentsContextValue = {
  courseEnrollmentsByStatus: {},
};

const EnrollModalWrapper = ({
  courseState = baseCourseInitialState,
  subsidyRequestContextValue = baseSubsidyRequestContextValue,
  courseEnrollmentsContextValue = baseCourseEnrollmentsContextValue,
  modalProps,
}) => (
  <SubsidyRequestsContext.Provider value={subsidyRequestContextValue}>
    <CourseEnrollmentsContext.Provider value={courseEnrollmentsContextValue}>
      <CourseContextProvider initialState={courseState}>
        <EnrollModal {...modalProps} />
      </CourseContextProvider>
    </CourseEnrollmentsContext.Provider>
  </SubsidyRequestsContext.Provider>
);

EnrollModalWrapper.propTypes = {
  courseState: PropTypes.shape(),
  subsidyRequestContextValue: PropTypes.shape(),
  courseEnrollmentsContextValue: PropTypes.shape(),
  modalProps: PropTypes.shape(),
};

EnrollModalWrapper.defaultProps = {
  courseState: baseCourseInitialState,
  subsidyRequestContextValue: baseSubsidyRequestContextValue,
  courseEnrollmentsContextValue: baseCourseEnrollmentsContextValue,
  modalProps: {},
};

describe('<EnrollModal />', () => {
  const defaultProps = {
    enrollmentUrl: 'foo',
    isModalOpen: true,
    setIsModalOpen: () => {},
    couponCodesCount: 1,
    hasCouponCodeForCourse: true,
  };
  it('displays the correct text when user has valid coupon codes', () => {
    render(<EnrollModalWrapper modalProps={defaultProps} />);
    expect(screen.getByText(modalText.hasCouponCodes.title)).toBeInTheDocument();
    expect(screen.getByText(modalText.hasCouponCodes.body(defaultProps.couponCodesCount))).toBeInTheDocument();
    expect(screen.getByText(modalText.hasCouponCodes.button)).toBeInTheDocument();
  });
  it('displays the correct text when user has no coupon codes', () => {
    const modalProps = {
      ...defaultProps,
      couponCodesCount: 0,
      hasCouponCodeForCourse: false,
    };
    render(<EnrollModalWrapper modalProps={modalProps} />);
    expect(screen.getByText(modalText.noCouponCodes.title)).toBeInTheDocument();
    expect(screen.getByText(modalText.noCouponCodes.body)).toBeInTheDocument();
    expect(screen.getByText(modalText.noCouponCodes.button)).toBeInTheDocument();
  });
  it('displays the correct text when user does not have a valid coupon code', () => {
    const modalProps = {
      ...defaultProps,
      hasCouponCodeForCourse: false,
    };
    render(<EnrollModalWrapper modalProps={modalProps} />);
    expect(screen.getByText(modalText.noCouponCodes.title)).toBeInTheDocument();
    expect(screen.getByText(modalText.noCouponCodes.body)).toBeInTheDocument();
    expect(screen.getByText(modalText.noCouponCodes.button)).toBeInTheDocument();
  });
});
