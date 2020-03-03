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

export function useCourseSubjects(course) {
  const [subjects, setSubjects] = useState([]);
  const [primarySubject, setPrimarySubject] = useState(undefined);

  useEffect(() => {
    if (course) {
      setSubjects(course.subjects);
    }
  }, [course]);

  useEffect(() => {
    if (subjects.length > 0) {
      const newSubject = {
        ...subjects[0],
        url: `${process.env.MARKETING_SITE_URL}/course/subject/${subjects[0].slug}`,
      };
      setPrimarySubject(newSubject);
    }
  }, [subjects]);

  return { subjects, primarySubject };
}

export function useCoursePartners(course) {
  const [partners, setPartners] = useState([]);
  const [label, setLabel] = useState(undefined);

  useEffect(() => {
    if (course) {
      const newOwners = course.owners.map(owner => ({
        ...owner,
        fullUrl: `${process.env.MARKETING_SITE_URL}/${owner.marketingUrl}`,
      }));
      setPartners(newOwners);
    }
  }, [course]);

  useEffect(() => {
    if (partners.length > 1) {
      setLabel('Institutions');
    } else {
      setLabel('Institution');
    }
  }, [partners]);

  return [partners, label];
}

export function useCourseRunWeeksToComplete(courseRun) {
  const [weeksToComplete, setWeeksToComplete] = useState(undefined);
  const [label, setLabel] = useState(undefined);

  useEffect(() => {
    if (courseRun) {
      setWeeksToComplete(courseRun.weeksToComplete);
    }
  }, [courseRun]);

  useEffect(() => {
    if (weeksToComplete > 1 || weeksToComplete === 0) {
      setLabel('weeks');
    } else {
      setLabel('week');
    }
  }, [weeksToComplete]);

  return [weeksToComplete, label];
}

export function useCourseTranscriptLanguages(courseRun) {
  const [languages, setLanguages] = useState([]);
  const [label, setLabel] = useState(undefined);

  useEffect(() => {
    if (courseRun) {
      setLanguages(courseRun.transcriptLanguages);
    }
  }, [courseRun]);

  useEffect(() => {
    if (languages.length > 1) {
      setLabel('Video Transcripts');
    } else {
      setLabel('Video Transcript');
    }
  }, [languages]);

  return [languages, label];
}
