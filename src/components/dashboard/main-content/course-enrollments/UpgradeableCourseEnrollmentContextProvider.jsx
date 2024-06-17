import React, {
  createContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useCourseUpgradeData } from './data/hooks';
import {
  useCouponCodes,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContent,
  useSubscriptions,
} from '../../../app/data';
import { findCouponCodeForCourse } from '../../../course/data';

export const UpgradeableCourseEnrollmentContext = createContext({ isLoading: false, upgradeUrl: undefined });

export const UpgradeableCourseEnrollmentContextProvider = ({ courseEnrollment, children }) => {
  const location = useLocation();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: subscriptions } = useSubscriptions();
  const { data: { catalogList } } = useEnterpriseCustomerContainsContent([courseEnrollment.courseRunId]);
  const { data: { couponSubsidy } } = useCouponCodes({
    select: (data) => (
      {
        couponSubsidy: findCouponCodeForCourse(data.couponCodeAssignments, catalogList),
      }
    ),
  });
  // If a licenseUpgradeUrl exists, couponUpgradeUrl will always be undefined
  // since we would always use the license to upgrade instead
  const {
    isLoading,
    subsidyForCourse,
    licenseUpgradeUrl,
    couponUpgradeUrl,
  } = useCourseUpgradeData({
    courseRunKey: courseEnrollment.courseRunId,
    enterpriseId: enterpriseCustomer.uuid,
    subscriptionLicense: subscriptions.subscriptionLicense,
    couponSubsidy,
    location,
  });

  const context = useMemo(() => ({
    isLoading, licenseUpgradeUrl, couponUpgradeUrl, subsidyForCourse,
  }), [
    isLoading,
    subsidyForCourse,
    licenseUpgradeUrl,
    couponUpgradeUrl,
  ]);

  return (
    <UpgradeableCourseEnrollmentContext.Provider value={context}>
      {children}
    </UpgradeableCourseEnrollmentContext.Provider>
  );
};

UpgradeableCourseEnrollmentContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  courseEnrollment: PropTypes.shape({
    courseRunId: PropTypes.string,
    linkToCourse: PropTypes.string,
  }).isRequired,
};
