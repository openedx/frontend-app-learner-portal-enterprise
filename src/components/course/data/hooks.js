import { useEffect, useState, useMemo } from 'react';
import qs from 'query-string';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { isDefinedAndNotNull } from '../../../utils/common';
import CourseService from './service';
import {
  isCourseInstructorPaced,
  isCourseSelfPaced,
  numberWithPrecision,
  findOfferForCourse,
} from './utils';
import {
  COURSE_PACING_MAP,
  SUBSIDY_DISCOUNT_TYPE_MAP,
  CURRENCY_USD,
  ENROLLMENT_FAILED_QUERY_PARAM,
} from './constants';
import { features } from '../../../config';

export function useAllCourseData({ courseKey, enterpriseConfig, courseRunKey }) {
  const [courseData, setCourseData] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (courseKey && enterpriseConfig) {
        const courseService = new CourseService({
          enterpriseUuid: enterpriseConfig.uuid,
          courseKey,
          courseRunKey,
        });
        try {
          const data = await courseService.fetchAllCourseData();
          setCourseData(data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      return undefined;
    };
    fetchData();
  }, [courseKey, enterpriseConfig]);
  return [camelCaseObject(courseData), fetchError];
}

export function useCourseSubjects(course) {
  const [subjects, setSubjects] = useState([]);
  const [primarySubject, setPrimarySubject] = useState(null);

  useEffect(() => {
    if (course?.subjects) {
      setSubjects(course.subjects);
      if (course.subjects.length > 0) {
        const newSubject = {
          ...course.subjects[0],
          url: `${process.env.MARKETING_SITE_BASE_URL}/course/subject/${course.subjects[0].slug}`,
        };
        setPrimarySubject(newSubject);
      }
    }
  }, [course]);

  return { subjects, primarySubject };
}

export function useCoursePartners(course) {
  const [partners, setPartners] = useState([]);
  const [label, setLabel] = useState();

  useEffect(() => {
    if (course?.owners) {
      setPartners(course.owners);
      if (course.owners.length > 1) {
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

export function useCoursePacingType(courseRun) {
  const [pacingType, setPacingType] = useState();

  useEffect(
    () => {
      if (isCourseSelfPaced(courseRun.pacingType)) {
        setPacingType(COURSE_PACING_MAP.SELF_PACED);
      }

      if (isCourseInstructorPaced(courseRun.pacingType)) {
        setPacingType(COURSE_PACING_MAP.INSTRUCTOR_PACED);
      }
    },
    [courseRun],
  );

  const pacingTypeContent = useMemo(
    () => {
      if (pacingType === COURSE_PACING_MAP.INSTRUCTOR_PACED) {
        return 'Instructor-led on a course schedule';
      }

      if (pacingType === COURSE_PACING_MAP.SELF_PACED) {
        return 'Self-paced on your time';
      }

      return undefined;
    },
    [pacingType],
  );

  return [pacingType, pacingTypeContent];
}

export function useFetchUserSubsidyForCourse(activeCourseRun, enterpriseConfig) {
  const [isLoading, setIsLoading] = useState(false);
  const [userSubsidy, setUserSubsidy] = useState();

  useEffect(
    () => {
      const fetchData = async () => {
        setIsLoading(true);
        const courseService = new CourseService({
          enterpriseUuid: enterpriseConfig.uuid,
          activeCourseRun,
        });
        try {
          const subsidy = await courseService.fetchEnterpriseUserSubsidy();
          setUserSubsidy(subsidy);
        } catch (error) {
          logError(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    },
    [activeCourseRun, enterpriseConfig],
  );

  return [userSubsidy, isLoading];
}

export function useCoursePriceForUserSubsidy(activeCourseRun, userSubsidy) {
  const currency = CURRENCY_USD;

  const coursePrice = useMemo(
    () => {
      const listPrice = activeCourseRun.firstEnrollablePaidSeatPrice;

      if (!listPrice) {
        return null;
      }

      const priceDetails = {
        list: numberWithPrecision(listPrice),
      };
      if (!userSubsidy) {
        return priceDetails;
      }

      const { discountType, discountValue } = userSubsidy;
      let discountedPrice;

      if (discountType === SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE) {
        discountedPrice = listPrice - (listPrice * (discountValue / 100));
      }

      if (discountType === SUBSIDY_DISCOUNT_TYPE_MAP.ABSOLUTE) {
        discountedPrice = Math.max(listPrice - discountValue, 0);
      }

      if (isDefinedAndNotNull(discountedPrice)) {
        priceDetails.discounted = numberWithPrecision(discountedPrice);
      } else {
        priceDetails.discounted = priceDetails.list;
      }

      return priceDetails;
    },
    [activeCourseRun, userSubsidy],
  );

  return [coursePrice, currency];
}

export function useCourseEnrollmentUrl({
  catalogList,
  enterpriseConfig,
  key,
  location,
  offers,
  sku,
  subscriptionLicense,
}) {
  const baseEnrollmentOptions = useMemo(
    () => {
      const enrollmentFailedParams = { ...qs.parse(location.search) };
      enrollmentFailedParams[ENROLLMENT_FAILED_QUERY_PARAM] = true;
      const baseOptions = {
        next: `${process.env.LMS_BASE_URL}/courses/${key}/course`,
        // Redirect back to the same page with a failure query param
        failure_url: `${global.location.href}?${qs.stringify(enrollmentFailedParams)}`,
      };
      return baseOptions;
    },
    [location],
  );

  const enrollmentUrl = useMemo(
    () => {
      if (subscriptionLicense) {
        const enrollOptions = {
          ...baseEnrollmentOptions,
          license_uuid: subscriptionLicense.uuid,
          course_id: key,
          enterprise_customer_uuid: enterpriseConfig.uuid,
        };
        return `${process.env.LMS_BASE_URL}/enterprise/grant_data_sharing_permissions/?${qs.stringify(enrollOptions)}`;
      }

      if (features.ENROLL_WITH_CODES && offers.length >= 0 && sku) {
        const enrollOptions = {
          ...baseEnrollmentOptions,
          sku,
        };
        // get the index of the first offer that applies to a catalog that the course is in
        const offerForCourse = findOfferForCourse(offers, catalogList);
        if (offers.length === 0 || !offerForCourse) {
          return `${process.env.ECOMMERCE_BASE_URL}/basket/add/?${qs.stringify(enrollOptions)}`;
        }
        enrollOptions.code = offerForCourse.code;
        return `${process.env.ECOMMERCE_BASE_URL}/coupons/redeem/?${qs.stringify(enrollOptions)}`;
      }

      // No offer or product SKU is present, so the course cannot be enrolled in.
      return null;
    },
    [baseEnrollmentOptions, subscriptionLicense, enterpriseConfig, offers, sku],
  );

  return enrollmentUrl;
}
