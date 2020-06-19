import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseEnrollments } from './course-enrollments';

const DashboardMainContent = () => {
  const { enterpriseConfig: { name, slug } } = useContext(AppContext);
  return (
    <CourseEnrollments>
      <h2 className="h3">Browse courses</h2>
      <p>
        You are not enrolled in any courses sponsored by {name}.
        To start taking a course, browse the catalog below.
      </p>
      <p>
        <Link to={`/${slug}/search`} className="btn btn-primary">
          Find a Course
        </Link>
      </p>
    </CourseEnrollments>
  );
};

export default DashboardMainContent;
