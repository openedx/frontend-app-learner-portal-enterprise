import {
  Row,
  MediaQuery,
  breakpoints,
} from '@openedx/paragon';
import { MainContent, Sidebar } from '../../layout';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../../course/CourseEnrollmentFailedAlert';
import DashboardMainContent from './DashboardMainContent';
import { DashboardSidebar } from '../sidebar';

const CoursesTabComponent = () => (
  <Row className="py-5">
    <CourseEnrollmentFailedAlert className="mt-0 mb-3" enrollmentSource={ENROLLMENT_SOURCE.DASHBOARD} />
    <MainContent>
      <DashboardMainContent />
    </MainContent>
    <MediaQuery minWidth={breakpoints.large.minWidth}>
      {matches => (matches && (
        <Sidebar data-testid="courses-tab-sidebar">
          <DashboardSidebar />
        </Sidebar>
      ))}
    </MediaQuery>
  </Row>
);

export default CoursesTabComponent;
