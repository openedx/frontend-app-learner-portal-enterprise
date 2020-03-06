import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import {
  fetchCourseDetails,
  fetchEnterpriseCustomerContainsContent,
  fetchUserEnrollments,
  fetchUserEntitlements,
} from './service';

function useActiveCourseRunFromCourse(course) {
  const [activeCourseRun, setActiveCourseRun] = useState(undefined);

  useEffect(() => {
    if (!course || !course.courseRuns) {
      setActiveCourseRun(null);
      return;
    }
    if (course.courseRuns.length === 1) {
      setActiveCourseRun(course.courseRuns[0]);
    } else if (course.courseRuns.length > 1) {
      setActiveCourseRun(course.courseRuns.pop());
    }
  }, [course]);

  return [activeCourseRun];
}

export function useCourseDetails(courseKey) {
  const [course, setCourse] = useState(undefined);
  const [activeCourseRun] = useActiveCourseRunFromCourse(course);

  useEffect(() => {
    if (courseKey) {
      fetchCourseDetails(courseKey)
        .then((response) => {
          const { data: courseData } = response;
          const transformedCourseData = camelCaseObject(courseData);
          setCourse(transformedCourseData);
        })
        .catch((error) => {
          setCourse(null);
          logError(new Error(error));
        });
    }
  }, [courseKey]);

  return [course, activeCourseRun];
}

export function useCourseSubjects(course) {
  const [subjects, setSubjects] = useState([]);
  const [primarySubject, setPrimarySubject] = useState(undefined);

  useEffect(() => {
    if (course && course.subjects) {
      setSubjects(course.subjects);
      if (course.subjects.length > 0) {
        const newSubject = {
          ...course.subjects[0],
          url: `${process.env.MARKETING_SITE_URL}/course/subject/${course.subjects[0].slug}`,
        };
        setPrimarySubject(newSubject);
      }
    }
  }, [course]);

  return [subjects, primarySubject];
}

export function useCoursePartners(course) {
  const [partners, setPartners] = useState([]);
  const [label, setLabel] = useState(undefined);

  useEffect(() => {
    if (course && course.owners) {
      const newOwners = course.owners.map(owner => ({
        ...owner,
        fullUrl: `${process.env.MARKETING_SITE_URL}/${owner.marketingUrl}`,
      }));
      setPartners(newOwners);
      if (newOwners.length > 1) {
        setLabel('Institutions');
      } else {
        setLabel('Institution');
      }
    }
  }, [course]);

  return [partners, label];
}

export function useCourseRunWeeksToComplete(courseRun) {
  const [weeksToComplete, setWeeksToComplete] = useState(undefined);
  const [label, setLabel] = useState(undefined);

  useEffect(() => {
    if (courseRun && courseRun.weeksToComplete) {
      setWeeksToComplete(courseRun.weeksToComplete);
      if (courseRun.weeksToComplete > 1 || courseRun.weeksToComplete === 0) {
        setLabel('weeks');
      } else {
        setLabel('week');
      }
    }
  }, [courseRun]);

  return [weeksToComplete, label];
}

export function useCourseTranscriptLanguages(courseRun) {
  const [languages, setLanguages] = useState([]);
  const [label, setLabel] = useState(undefined);

  useEffect(() => {
    if (courseRun && courseRun.transcriptLanguages) {
      setLanguages(courseRun.transcriptLanguages);
      if (courseRun.transcriptLanguages.length > 1) {
        setLabel('Video Transcripts');
      } else {
        setLabel('Video Transcript');
      }
    }
  }, [courseRun]);

  return [languages, label];
}

export function useUserEnrollments() {
  const [userEnrollments, setUserEnrollments] = useState([]);
  useEffect(() => {
    fetchUserEnrollments()
      .then((response) => {
        const { data: enrollmentsData } = response;
        const transformedEnrollmentsData = camelCaseObject(enrollmentsData);
        setUserEnrollments(transformedEnrollmentsData);
      })
      .catch((error) => {
        logError(new Error(error));
      });
  }, []);

  return [userEnrollments];
}

export function useUserEntitlements() {
  const [userEntitlements, setUserEntitlements] = useState([]);
  useEffect(() => {
    fetchUserEntitlements()
      .then((response) => {
        const { data: entitlementsData } = response;
        const transformedEntitlementsData = camelCaseObject(entitlementsData.results);
        setUserEntitlements(transformedEntitlementsData);
      })
      .catch((error) => {
        logError(new Error(error));
      });
  }, []);

  return [userEntitlements];
}

export function useCourseInEnterpriseCatalog({
  courseKey,
  enterpriseConfig,
}) {
  const [isCourseInCatalog, setIsCourseInCatalog] = useState(undefined);

  useEffect(() => {
    if (courseKey && enterpriseConfig) {
      const { uuid: enterpriseUuid } = enterpriseConfig;
      fetchEnterpriseCustomerContainsContent({ enterpriseUuid, courseKey })
        .then((response) => {
          const { data: responseData } = response;
          const transformedResponseData = camelCaseObject(responseData);
          setIsCourseInCatalog(transformedResponseData.containsContentItems);
        })
        .catch((error) => {
          logError(new Error(error));
        });
    }
  }, [courseKey, enterpriseConfig]);

  return [isCourseInCatalog];
}
