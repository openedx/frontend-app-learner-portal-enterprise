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
      <h2 className="h3">Find a course</h2>
      <p>
        You are not enrolled in any courses sponsored by {name}.
        To start taking a course, browse the catalog below.
      </p>
      <p>
        <Link
          to={`/${slug}/search`}
          className={classNames('btn', 'btn-primary', { disabled: !hasAccessToPortal })}
        >
          Find a Course
        </Link>
      </p>
    </CourseEnrollments>
  );
};

export default DashboardMainContent;
