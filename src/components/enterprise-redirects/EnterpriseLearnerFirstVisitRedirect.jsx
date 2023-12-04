import React, { useContext, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { ASSIGNMENT_TYPES } from '../dashboard/main-content/course-enrollments/CourseEnrollments';
import { UserSubsidyContext } from '../enterprise-user-subsidy';

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
  const hasActiveCourseAssignments = (learnerCreditPolicies) => {
    const learnerContentAssignmentsArray = learnerCreditPolicies?.flatMap(
      item => item?.learnerContentAssignments || [],
    );
    // filters out course assignments that are not considered active
    const hasActiveAssignments = learnerContentAssignmentsArray.filter(
      assignment => assignment.state !== ASSIGNMENT_TYPES.cancelled,
    );
    return hasActiveAssignments.length > 0;
  };
  useEffect(() => {
    const cookies = new Cookies();

    if (isFirstDashboardPageVisit()) {
      cookies.set('has-user-visited-learner-dashboard', true, { path: '/' });
    }
  }, []);
  if (!hasActiveCourseAssignments(redeemableLearnerCreditPolicies) && isFirstDashboardPageVisit()) {
    return <Redirect to={`/${enterpriseSlug}/search`} />;
  }

  return null;
};

export default EnterpriseLearnerFirstVisitRedirect;
