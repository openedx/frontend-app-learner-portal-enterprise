import {
  useEffect, useState, useMemo, useContext,
} from 'react';
import qs from 'query-string';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';

import { isDefinedAndNotNull } from '../../../utils/common';
import CourseService from './service';
import {
  isCourseInstructorPaced,
  isCourseSelfPaced,
  numberWithPrecision,
  findOfferForCourse,
  hasLicenseSubsidy,
  hasCourseStarted,
  findUserEnrollmentForCourse,
  findHighestLevelSeatSku,
} from './utils';
import {
  COURSE_PACING_MAP,
  SUBSIDY_DISCOUNT_TYPE_MAP,
  CURRENCY_USD,
  ENROLLMENT_FAILED_QUERY_PARAM,
} from './constants';
import { features } from '../../../config';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';

import { CourseContext } from '../CourseContextProvider';

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
  const config = getConfig();

  useEffect(() => {
    if (course?.subjects) {
      setSubjects(course.subjects);
      if (course.subjects.length > 0) {
        const newSubject = {
          ...course.subjects[0],
          url: `${config.MARKETING_SITE_BASE_URL}/course/subject/${course.subjects[0].slug}`,
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
  userSubsidy,
}) {
  const config = getConfig();
  const enrollmentFailedParams = { ...qs.parse(location.search) };
  enrollmentFailedParams[ENROLLMENT_FAILED_QUERY_PARAM] = true;
  const baseEnrollmentOptions = {
    next: `${config.LMS_BASE_URL}/courses/${key}/course`,
    // Redirect back to the same page with a failure query param
    failure_url: `${global.location.href}?${qs.stringify(enrollmentFailedParams)}`,
  };

  const enrollmentUrl = useMemo(
    () => {
      // Users must have a license and a valid subsidy from that license to enroll with it
      if (subscriptionLicense && hasLicenseSubsidy(userSubsidy)) {
        const enrollOptions = {
          ...baseEnrollmentOptions,
          license_uuid: subscriptionLicense.uuid,
          course_id: key,
          enterprise_customer_uuid: enterpriseConfig.uuid,
        };
        return `${config.LMS_BASE_URL}/enterprise/grant_data_sharing_permissions/?${qs.stringify(enrollOptions)}`;
      }

      if (features.ENROLL_WITH_CODES && offers.length >= 0 && sku) {
        const enrollOptions = {
          ...baseEnrollmentOptions,
          sku,
        };
        // get the index of the first offer that applies to a catalog that the course is in
        const offerForCourse = findOfferForCourse(offers, catalogList);
        if (offers.length === 0 || !offerForCourse) {
          return `${config.ECOMMERCE_BASE_URL}/basket/add/?${qs.stringify(enrollOptions)}`;
        }
        enrollOptions.code = offerForCourse.code;
        return `${config.ECOMMERCE_BASE_URL}/coupons/redeem/?${qs.stringify(enrollOptions)}`;
      }

      // No offer or product SKU is present, so the course cannot be enrolled in.
      return null;
    },
    [baseEnrollmentOptions, subscriptionLicense, enterpriseConfig, offers, sku],
  );

  return enrollmentUrl;
}

/**
 * A hook to obtain data, for use with the enroll button for example. It answers these questions
 * by reading the CourseContext context:
 *
 * 1. isUserEnrolled
 * 2. isCourseStarted
 * 3. isEnrollable
 *
 * These three answers can help with the main flow of EnrollButton.
 */
export function useCourseData() {
  const { state: courseData } = useContext(CourseContext);
  const { activeCourseRun, userEnrollments, userEntitlements } = courseData;
  const { start, key, isEnrollable } = activeCourseRun;

  const isCourseStarted = useMemo(
    () => hasCourseStarted(start),
    [start],
  );

  const userEnrollment = useMemo(
    () => findUserEnrollmentForCourse({ userEnrollments, key }),
    [userEnrollments, key],
  );

  return {
    isUserEnrolled: !!userEnrollment,
    isCourseStarted,
    isEnrollable,
    activeCourseRun,
    userEntitlements,
  };
}

/**
 * Get subscriptions, offers info about the user.
 */
export function useSubsidies() {
  const { subscriptionLicense, offers } = useContext(UserSubsidyContext);
  return {
    subscriptionLicense,
    offers,
  };
}

/**
 * @param {object} args arguments.
 * @param {object} args.enterpriseConfig enterprise configuration.
 * @param {object} args.location location for react router
 */
export function useEnrollmentUrl({ enterpriseConfig, location }) {
  const { state: courseData } = useContext(CourseContext);
  const { subscriptionLicense, offers } = useSubsidies();
  const {
    activeCourseRun: { seats, key },
    userSubsidy,
    catalog: { catalogList },
  } = courseData;

  const sku = useMemo(
    () => findHighestLevelSeatSku(seats),
    [seats],
  );

  const enrollmentUrl = useCourseEnrollmentUrl({
    catalogList,
    enterpriseConfig,
    key,
    location,
    offers,
    sku,
    subscriptionLicense,
    userSubsidy,
  });
  return enrollmentUrl;
}
