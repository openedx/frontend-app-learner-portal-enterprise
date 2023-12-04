import React, { useContext, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import getActiveAssignments from '../dashboard/data/utils';

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

  // TODO: Refactor to DRY up code for redeemableLearnerCreditPolicies
  const hasActiveContentAssignments = (learnerCreditPolicies) => {
    const learnerContentAssignmentsArray = learnerCreditPolicies?.flatMap(
      item => item?.learnerContentAssignments || [],
    );
    // filters out course assignments that are not considered active and returns a boolean value
    return getActiveAssignments(learnerContentAssignmentsArray).hasActiveAssignments;
  };
  useEffect(() => {
    const cookies = new Cookies();

    if (isFirstDashboardPageVisit()) {
      cookies.set('has-user-visited-learner-dashboard', true, { path: '/' });
    }
  }, []);

  if (!hasActiveContentAssignments(redeemableLearnerCreditPolicies) && isFirstDashboardPageVisit()) {
    return <Redirect to={`/${enterpriseSlug}/search`} />;
  }

  return null;
};

export default EnterpriseLearnerFirstVisitRedirect;
