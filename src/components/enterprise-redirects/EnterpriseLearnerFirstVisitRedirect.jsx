import React, { useContext, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { UserSubsidyContext } from '../enterprise-user-subsidy';

export const isFirstDashboardPageVisit = () => {
  const cookies = new Cookies();

  const hasUserVisitedDashboard = cookies.get('has-user-visited-learner-dashboard');
  return !hasUserVisitedDashboard;
};

const EnterpriseLearnerFirstVisitRedirect = () => {
  const { enterpriseSlug } = useParams();
  const { redeemableLearnerCreditPolicies } = useContext(UserSubsidyContext);
  const hasAssignmentsForDisplay = (
    !!redeemableLearnerCreditPolicies?.learnerContentAssignments.hasAssignmentsForDisplay
  );

  useEffect(() => {
    const cookies = new Cookies();

    if (isFirstDashboardPageVisit()) {
      cookies.set('has-user-visited-learner-dashboard', true, { path: '/' });
    }
  }, []);

  if (!hasAssignmentsForDisplay && isFirstDashboardPageVisit()) {
    return <Redirect to={`/${enterpriseSlug}/search`} />;
  }

  return null;
};

export default EnterpriseLearnerFirstVisitRedirect;
