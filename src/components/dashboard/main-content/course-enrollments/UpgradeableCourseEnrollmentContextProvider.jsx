import React, {
  createContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { useCourseUpgradeData } from './data/hooks';

export const UpgradeableCourseEnrollmentContext = createContext({ isLoading: false, upgradeUrl: undefined });

export const UpgradeableCourseEnrollmentContextProvider = ({ courseEnrollment, children }) => {
  // If a licenseUpgradeUrl exists, couponUpgradeUrl will always be undefined
  // since we would always use the license to upgrade instead
  const {
    isLoading,
    subsidyForCourse,
    licenseUpgradeUrl,
    couponUpgradeUrl,
  } = useCourseUpgradeData({
    courseRunKey: courseEnrollment.courseRunId,
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
