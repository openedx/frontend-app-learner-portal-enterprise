import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  useToggle,
  Row,
  Alert,
  MediaQuery,
  breakpoints,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { CourseEnrollmentsContextProvider } from './course-enrollments';
import { MainContent, Sidebar } from '../../layout';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../../course/CourseEnrollmentFailedAlert';
import DashboardMainContent from './DashboardMainContent';
import { DashboardSidebar } from '../sidebar';
import { useEnterpriseCourseEnrollments } from '../../app/data';

const CoursesTabComponent = () => {
  const {
    data: enrollmentsData,
  } = useEnterpriseCourseEnrollments();

  return (
    <Row className="py-5">
      {/* <CourseEnrollmentFailedAlert className="mt-0 mb-3" enrollmentSource={ENROLLMENT_SOURCE.DASHBOARD} /> */}
      <MainContent>
        <DashboardMainContent />
        {/* <pre>
          {JSON.stringify(enrollmentsData, null, 2)}
        </pre> */}
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
};

export default CoursesTabComponent;
