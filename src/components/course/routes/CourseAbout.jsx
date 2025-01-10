import {
  breakpoints, Col, Container, MediaQuery, Row,
} from '@openedx/paragon';

import { MainContent, Sidebar } from '../../layout';
import CourseHeader from '../course-header/CourseHeader';
import CourseMainContent from '../CourseMainContent';
import CourseSidebar from '../CourseSidebar';
import CourseRecommendations from '../CourseRecommendations';
import {
  useCanOnlyViewHighlights,
  useEnterpriseCustomer,
  useIsAssignmentsOnlyLearner,
  usePassLearnerCsodParams,
} from '../../app/data';
import BlockingSubscriptionExpirationModal from '../../expired-subscription-modal';

const CourseAbout = () => {
  const { data: canOnlyViewHighlightSets } = useCanOnlyViewHighlights();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const isAssignmentOnlyLearner = useIsAssignmentsOnlyLearner();

  const shouldShowCourseRecommendations = (
    !canOnlyViewHighlightSets
    && !enterpriseCustomer.disableSearch
    && !isAssignmentOnlyLearner
  );
  usePassLearnerCsodParams();

  return (
    <>
      <BlockingSubscriptionExpirationModal />
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
        </Row>
        {shouldShowCourseRecommendations && (
          <Row>
            <Col>
              <CourseRecommendations />
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default CourseAbout;
