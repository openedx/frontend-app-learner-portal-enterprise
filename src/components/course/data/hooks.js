import { useState, useEffect } from 'react';
import camelcaseKeys from 'camelcase-keys';

import { fetchCourseDetails } from './service';

function useActiveCourseRunFromCourse(course) {
  const [activeCourseRun, setActiveCourseRun] = useState(undefined);

  useEffect(() => {
    if (!course || !course.courseRuns) {
      return;
    }
    if (course.courseRuns.length === 1) {
      setActiveCourseRun(course.courseRuns[0]);
    } else if (course.courseRuns.length > 1) {
      setActiveCourseRun(course.courseRuns.pop());
    }
  }, [course]);

  return activeCourseRun;
}

// eslint-disable-next-line import/prefer-default-export
export function useCourseDetails(courseKey) {
  const [course, setCourse] = useState(undefined);
  const activeCourseRun = useActiveCourseRunFromCourse(course);

  useEffect(() => {
    fetchCourseDetails(courseKey)
      .then((response) => {
        const { data: courseData } = response;
        const transformedCourseData = camelcaseKeys(courseData, { deep: true });
        setCourse(transformedCourseData);
      });
  }, [courseKey]);

  return [course, activeCourseRun];
}
