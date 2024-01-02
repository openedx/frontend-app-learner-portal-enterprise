import React, { useContext } from 'react';
import {
  breakpoints, Container, MediaQuery, Row,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { Redirect } from 'react-router-dom';

import { MainContent, Sidebar } from '../../layout';
import CourseHeader from '../course-header/CourseHeader';
import CourseMainContent from '../CourseMainContent';
import CourseSidebar from '../CourseSidebar';
import CourseRecommendations from '../CourseRecommendations';
import { CourseContext } from '../CourseContextProvider';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { isDisableCourseSearch } from '../../enterprise-user-subsidy/enterprise-offers/data/utils';
import { useIsCourseAssigned } from '../data/hooks';
import { features } from '../../../config';

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
    enterpriseOffers,
    subscriptionPlan,
    subscriptionLicense,
    couponCodes,
  } = useContext(UserSubsidyContext);

  const isCourseAssigned = useIsCourseAssigned(redeemableLearnerCreditPolicies?.learnerContentAssignments, course?.key);
  const isCourseSearchDisabled = isDisableCourseSearch(
    redeemableLearnerCreditPolicies,
    enterpriseOffers,
    subscriptionPlan,
    subscriptionLicense,
    couponCodes.couponCodes,
  );

  const featuredIsCourseSearchDisabled = features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && isCourseSearchDisabled;
  if (!isCourseAssigned && featuredIsCourseSearchDisabled) {
    return <Redirect to={`/${enterpriseConfig.slug}`} />;
  }

  const shouldShowCourseRecommendations = (
    !canOnlyViewHighlightSets
    && !enterpriseConfig.disableSearch
    && !featuredIsCourseSearchDisabled
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
