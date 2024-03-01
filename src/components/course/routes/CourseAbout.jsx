import React, { useContext } from 'react';
import {
  breakpoints, Container, MediaQuery, Row,
} from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
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
import { determineLearnerHasContentAssignmentsOnly } from '../../enterprise-user-subsidy/data/utils';
import { SUBSIDY_TYPE, SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

const CourseAbout = () => {
  const {
    canOnlyViewHighlightSets,
    state: {
      course,
    },
  } = useContext(CourseContext);
  const { enterpriseConfig } = useContext(AppContext);
  const {
    redeemableLearnerCreditPolicies,
    hasCurrentEnterpriseOffers,
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodesCount },
  } = useContext(UserSubsidyContext);
  const isCourseAssigned = useIsCourseAssigned(redeemableLearnerCreditPolicies.learnerContentAssignments, course?.key);
  const { requestsBySubsidyType } = useContext(SubsidyRequestsContext);

  const licenseRequests = requestsBySubsidyType[SUBSIDY_TYPE.LICENSE];
  const couponCodeRequests = requestsBySubsidyType[SUBSIDY_TYPE.COUPON];

  const isAssignmentOnlyLearner = determineLearnerHasContentAssignmentsOnly({
    subscriptionPlan,
    subscriptionLicense,
    licenseRequests,
    couponCodesCount,
    couponCodeRequests,
    redeemableLearnerCreditPolicies,
    hasCurrentEnterpriseOffers,
  });

  const featuredIsAssignmentOnlyLearner = features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && isAssignmentOnlyLearner;
  if (!isCourseAssigned && featuredIsAssignmentOnlyLearner) {
    return <Navigate to={`/${enterpriseConfig.slug}`} replace />;
  }

  const shouldShowCourseRecommendations = (
    !canOnlyViewHighlightSets
    && !enterpriseConfig.disableSearch
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
