import React from 'react';
import { useParams } from 'react-router-dom';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import { CourseContextProvider } from './CourseContextProvider';
import Course from './Course';

import {
  useCourseDetails,
  useUserEnrollments,
  useUserEntitlements,
} from './data/hooks';

export default function CoursePage() {
  const { courseKey } = useParams();
  const [course, activeCourseRun] = useCourseDetails(courseKey);
  const [userEnrollments] = useUserEnrollments();
  const [userEntitlements] = useUserEntitlements();

  if (course === undefined) {
    return null;
  }

  return (
    <EnterprisePage>
      <Layout>
        <EnterpriseBanner />
        {course === null ? (
          <div className="container-fluid py-4">
            <p>Course Not Found</p>
          </div>
        ) : (
          <CourseContextProvider>
            <Course
              course={course}
              activeCourseRun={activeCourseRun}
              userEnrollments={userEnrollments}
              userEntitlements={userEntitlements}
            />
          </CourseContextProvider>
        )}
      </Layout>
    </EnterprisePage>
  );
}
