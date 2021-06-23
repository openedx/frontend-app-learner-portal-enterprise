import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Button } from '@edx/paragon';

import { CourseEnrollments } from './course-enrollments';

const DashboardMainContent = () => {
  const { enterpriseConfig: { name, slug } } = useContext(AppContext);

  return (
    <CourseEnrollments>
      {/* The children below will only be rendered if there are no course runs. */}
      <h2>Find a Course</h2>
      <p>
        You are not enrolled in any courses sponsored by {name}.
        To start taking a course, browse the catalog below.
      </p>
      <p>
        <Button
          as={Link}
          to={`/${slug}/search`}
          className="btn-brand-primary"
        >
          Find a course
        </Button>
      </p>
    </CourseEnrollments>
  );
};

export default DashboardMainContent;
