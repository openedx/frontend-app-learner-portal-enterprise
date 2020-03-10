import React, { useContext } from 'react';

import { AppContext } from '@edx/frontend-platform/react';

import { DashboardSidebar } from '../sidebar';
import { CourseEnrollments } from './course-enrollments';

const DashboardMainContent = () => {
  const { enterpriseConfig: { name } } = useContext(AppContext);
  return (
    <CourseEnrollments sidebarComponent={<DashboardSidebar />}>
      <h2 className="h3">Browse courses</h2>
      <p>
        You are not enrolled in any courses sponsored by {name}.
        To start taking a course, browse the catalog below.
      </p>
      <p>
        <a href={process.env.CATALOG_BASE_URL} className="btn btn-primary">
          Browse full catalog
        </a>
      </p>
    </CourseEnrollments>
  );
};

export default DashboardMainContent;
