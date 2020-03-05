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

import { isEmpty } from '../../utils';

export default function CoursePage() {
  const { courseKey } = useParams();
  const [course, activeCourseRun] = useCourseDetails(courseKey);
  const [userEnrollments] = useUserEnrollments();
  const [userEntitlements] = useUserEntitlements();

  if (isEmpty(course) || isEmpty(activeCourseRun)) {
    return null;
  }

  return (
    <EnterprisePage>
      {() => (
        <Layout>
          <EnterpriseBanner />
          <CourseContextProvider>
            <Course
              course={course}
              activeCourseRun={activeCourseRun}
              userEnrollments={userEnrollments}
              userEntitlements={userEntitlements}
            />
          </CourseContextProvider>
        </Layout>
      )}
    </EnterprisePage>
  );
}
