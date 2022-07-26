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
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  const location = useLocation();

  const { isLoading, upgradeUrl } = useCourseUpgradeData({
    courseRunKey: courseEnrollment.courseRunId,
    enterpriseId: enterpriseConfig.uuid,
    subscriptionLicense,
    location,
  });

  const context = useMemo(() => ({
    isLoading, upgradeUrl,
  }), [isLoading, upgradeUrl]);

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
