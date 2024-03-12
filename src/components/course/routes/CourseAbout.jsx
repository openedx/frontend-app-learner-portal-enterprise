import React, { useContext } from 'react';
import {
  breakpoints, Container, MediaQuery, Row,
} from '@openedx/paragon';
import { Navigate } from 'react-router-dom';

import { MainContent, Sidebar } from '../../layout';
import CourseHeader from '../course-header/CourseHeader';
import CourseMainContent from '../CourseMainContent';
import CourseSidebar from '../CourseSidebar';
import CourseRecommendations from '../CourseRecommendations';
import { CourseContext } from '../CourseContextProvider';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { useIsCourseAssigned } from '../data/hooks';
import { features } from '../../../config';
import { useEnterpriseCustomer, useIsAssignmentsOnlyLearner } from '../../app/data';

const CourseAbout = () => {
  const {
    canOnlyViewHighlightSets,
    state: {
      course,
    },
  } = useContext(CourseContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const {
    redeemableLearnerCreditPolicies,
  } = useContext(UserSubsidyContext);
  const isCourseAssigned = useIsCourseAssigned(redeemableLearnerCreditPolicies.learnerContentAssignments, course?.key);
  const isAssignmentOnlyLearner = useIsAssignmentsOnlyLearner();

  const featuredIsAssignmentOnlyLearner = features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && isAssignmentOnlyLearner;
  if (!isCourseAssigned && featuredIsAssignmentOnlyLearner) {
    return <Navigate to={`/${enterpriseCustomer.slug}`} replace />;
  }

  const shouldShowCourseRecommendations = (
    !canOnlyViewHighlightSets
    && !enterpriseCustomer.disableSearch
    && !featuredIsAssignmentOnlyLearner
  );

  return (
    <>
      <CourseHeader />
      <Container size="lg" className="py-5">
        <Row>
          <MainContent>
            <CourseMainContent />
          </MainContent>
          <MediaQuery minWidth={breakpoints.large.minWidth}>
            {matches => matches && (
              <Sidebar>
                <CourseSidebar />
              </Sidebar>
            )}
          </MediaQuery>
          {shouldShowCourseRecommendations && <CourseRecommendations />}
        </Row>
      </Container>
    </>
  );
};

export default CourseAbout;
