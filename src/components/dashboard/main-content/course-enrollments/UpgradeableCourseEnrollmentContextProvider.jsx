import React, {
  createContext, useMemo, useContext,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { useLocation } from 'react-router-dom';
import { useCourseUpgradeData } from './data/hooks';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';

export const UpgradeableCourseEnrollmentContext = createContext({ isLoading: false, upgradeUrl: undefined });

export const UpgradeableCourseEnrollmentContextProvider = ({ courseEnrollment, children }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionLicense, couponCodes: { couponCodes } } = useContext(UserSubsidyContext);
  const location = useLocation();

  // If a licenseUpgradeUrl exists, couponUpgradeUrl will always be undefined
  // since we would always use the license to upgrade instead
  const {
    isLoading,
    subsidyForCourse,
    licenseUpgradeUrl,
    couponUpgradeUrl,
  } = useCourseUpgradeData({
    courseRunKey: courseEnrollment.courseRunId,
    enterpriseId: enterpriseConfig.uuid,
    subscriptionLicense,
    couponCodes,
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
