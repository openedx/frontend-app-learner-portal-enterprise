import React, { useContext, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import useActiveAssignments from '../dashboard/data/hooks';

export const isFirstDashboardPageVisit = () => {
  const cookies = new Cookies();

  const hasUserVisitedDashboard = cookies.get('has-user-visited-learner-dashboard');
  return !hasUserVisitedDashboard;
};

const EnterpriseLearnerFirstVisitRedirect = () => {
  const { enterpriseSlug } = useParams();
  const {
    redeemableLearnerCreditPolicies,
  } = useContext(UserSubsidyContext);
  const {
    hasActiveAssignments,
  } = useActiveAssignments(redeemableLearnerCreditPolicies);

  useEffect(() => {
    const cookies = new Cookies();

    if (isFirstDashboardPageVisit()) {
      cookies.set('has-user-visited-learner-dashboard', true, { path: '/' });
    }
  }, []);

  if (!hasActiveAssignments && isFirstDashboardPageVisit()) {
    return <Redirect to={`/${enterpriseSlug}/search`} />;
  }

  return null;
};

export default EnterpriseLearnerFirstVisitRedirect;
