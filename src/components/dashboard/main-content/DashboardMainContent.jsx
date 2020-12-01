import React, { useContext } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseEnrollments } from './course-enrollments';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';

const DashboardMainContent = () => {
  const { enterpriseConfig: { name, slug } } = useContext(AppContext);
  const { hasAccessToPortal } = useContext(UserSubsidyContext);

  return (
    <CourseEnrollments>
      {/*
          The children below will only be rendered if there are no course runs.
       */}
      <h2>Find a Course</h2>
      <p>
        You are not enrolled in any courses sponsored by {name}.
        To start taking a course, browse the catalog below.
      </p>
      <p>
        <Link
          to={`/${slug}/search`}
          className={classNames(
            'btn', 'btn-primary', 'btn-brand-primary',
            { disabled: !hasAccessToPortal },
          )}
        >
          Find a course
        </Link>
      </p>
    </CourseEnrollments>
  );
};

export default DashboardMainContent;
