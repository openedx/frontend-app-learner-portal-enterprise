import {
  breakpoints, MediaQuery, Stack,
} from '@openedx/paragon';

import { CourseEnrollments } from './course-enrollments';
import SupportInformation from '../sidebar/SupportInformation';
import SubsidiesSummary from '../sidebar/SubsidiesSummary';
import CourseEnrollmentsEmptyState from './course-enrollments/CourseEnrollmentsEmptyState';

const DashboardMainContent = () => (
  <Stack gap={5}>
    <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
      {matches => (matches && (
        <SubsidiesSummary />
      ))}
    </MediaQuery>
    <div>
      <CourseEnrollments>
        {/* The children below will only be rendered if there are no course enrollments. */}
        <CourseEnrollmentsEmptyState />
      </CourseEnrollments>
    </div>
    <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
      {matches => (matches && <SupportInformation />)}
    </MediaQuery>
  </Stack>
);

export default DashboardMainContent;
