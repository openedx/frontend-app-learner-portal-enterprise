import {
  useEffect, useState, useMemo, useContext, useCallback,
} from 'react';
import qs from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';

import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';

import { isDefinedAndNotNull } from '../../../utils/common';
import CourseService from './service';
import { CourseContext } from '../CourseContextProvider';
import {
  isCourseInstructorPaced,
  isCourseSelfPaced,
  findOfferForCourse,
  hasLicenseSubsidy,
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

  // todo: this could get refactored, but since we already fetch offers
  // we simply pass offers along to the `fetchAllCourseData` call to 'fetch' it back
  const { offers: { offers } } = useContext(UserSubsidyContext);

  useEffect(() => {
    const fetchData = async () => {
      if (courseKey && enterpriseConfig) {
        const courseService = new CourseService({
          enterpriseUuid: enterpriseConfig.uuid,
          courseKey,
          courseRunKey,
        });
        try {
          const data = await courseService.fetchAllCourseData({ offers });
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

/**
 * Determines course price based on userSubsidy and course info.
 * @param {object} args Arguments.
 * @param {Object} args.activeCourseRun course run info
 * @param {Object} args.userSubsidyApplicableToCourse Usersubsidy
 *
 * @returns {Object} { activeCourseRun, userSubsidyApplicableToCourse }
 */
export const useCoursePriceForUserSubsidy = ({
  activeCourseRun, userSubsidyApplicableToCourse,
}) => {
  const currency = CURRENCY_USD;

  const coursePrice = useMemo(
    () => {
      const listPrice = activeCourseRun.firstEnrollablePaidSeatPrice;

      if (!listPrice) {
        return null;
      }

      const onlyListPrice = {
        list: listPrice,
      };

      if (userSubsidyApplicableToCourse) {
        const { discountType, discountValue } = userSubsidyApplicableToCourse;
        let discountedPrice;

        if (discountType
            && discountType.toLowerCase() === SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toLowerCase()) {
          discountedPrice = listPrice - (listPrice * (discountValue / 100));
        }

        if (discountType
            && discountType.toLowerCase() === SUBSIDY_DISCOUNT_TYPE_MAP.ABSOLUTE.toLowerCase()) {
          discountedPrice = Math.max(listPrice - discountValue, 0);
        }

        if (isDefinedAndNotNull(discountedPrice)) {
          return {
            ...onlyListPrice,
            discounted: discountedPrice,
          };
        }
        return {
          ...onlyListPrice,
          discounted: onlyListPrice.list,
        };
      }

      // Case 2: No subsidy available for course
      return onlyListPrice;
    },
    [activeCourseRun, userSubsidyApplicableToCourse],
  );

  return [coursePrice, currency];
};

useCoursePriceForUserSubsidy.propTypes = {
  activeCourseRun: PropTypes.shape({}).isRequired,
  userSubsidyApplicableToCourse: PropTypes.shape({
    discountType: PropTypes.string.isRequired,
    discountValue: PropTypes.number.isRequired,
    expirationDate: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    subsidyId: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * Get enrollment url for a particular course
 *
 * @param {object} args Arguments.
 * @param {Array.<object>} args.catalogList list of catalogs
 * @param {object} args.enterpriseConfig config for enterprise
 * @param {string} args.key course key
 * @param {object} args.location just an object with a 'search' field (usually from useLocation())
 * @param {Array.<object>} args.offers array of offer objects for course
 * @param {string} args.sku course SKU
 * @param {object} args.subscriptionLicense license for subscription | null
 * @param {object} args.userSubsidyApplicableToCourse subsidy for course if found | null
 *
 * @returns {string} url for enrollment
 */
export const useCourseEnrollmentUrl = ({
  catalogList,
  enterpriseConfig,
  key,
  location,
  offers = [],
  sku,
  subscriptionLicense,
  userSubsidyApplicableToCourse,
}) => {
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
      if (subscriptionLicense && hasLicenseSubsidy(userSubsidyApplicableToCourse)) {
        const enrollOptions = {
          ...baseEnrollmentOptions,
          license_uuid: subscriptionLicense.uuid,
          course_id: key,
          enterprise_customer_uuid: enterpriseConfig.uuid,
          // We don't want any sidebar text we show the data consent page from this workflow since
          // the text on the sidebar is used when a learner is coming from their employer's system.
          left_sidebar_text_override: '',
        };
        return `${config.LMS_BASE_URL}/enterprise/grant_data_sharing_permissions/?${qs.stringify(enrollOptions)}`;
      }

      if (features.ENROLL_WITH_CODES && offers.length >= 0 && sku) {
        const enrollOptions = {
          ...baseEnrollmentOptions,
          sku,
          consent_url_param_string: encodeURI('left_sidebar_text_override='), // Deliberately doubly encoded since it will get parsed on the redirect.
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
};

useCourseEnrollmentUrl.propTypes = {
  catalogList: PropTypes.shape({}).isRequired,
  enterpriseConfig: PropTypes.shape({}).isRequired,
  key: PropTypes.string.isRequired,
  location: PropTypes.shape({}).isRequired,
  offers: PropTypes.arrayOf(PropTypes.shape({})),
  sku: PropTypes.string.isRequired,
  subscriptionLicense: PropTypes.shape({}).isRequired,
  userSubsidyApplicableToCourse: PropTypes.shape({}).isRequired,
};

/**
 * A hook that parses the URL query parameters to extract an objectId and queryId and then
 * immediately remove them from the URL via a history replace to keep the URLs clean.
 *
 * @returns An object containing the Algolia objectId and queryId that led to a page view of the Course page.
 */
export const useExtractAndRemoveSearchParamsFromURL = () => {
  const { search } = useLocation();
  const history = useHistory();
  const [algoliaSearchParams, setAlgoliaSearchParams] = useState({
    queryId: undefined,
    objectId: undefined,
  });

  const queryParams = useMemo(
    () => camelCaseObject(qs.parse(search)),
    [search],
  );
  const { queryId, objectId } = queryParams;

  useEffect(
    () => {
      if (queryId && objectId) {
        setAlgoliaSearchParams({ queryId, objectId });
        delete queryParams.queryId;
        delete queryParams.objectId;
        history.replace({
          search: qs.stringify(queryParams),
        });
      }
    },
    [queryParams],
  );

  return algoliaSearchParams;
};

/**
 * Returns a function to be used as a click handler that emits an analytics event for a
 * search conversion via ``sendTrackEvent``. When used on a hyperlink (i.e., `href` is specified),
 * a imperceivable delay is introduced to allow enough time for analytic event request to resolve.
 *
 * @param {object} args
 * @param {string} args.href If click handler is used on a hyperlink, this is the destination url.
 * @param {string} args.eventName Name of the event
 *
 * @returns Click handler function for clicks on buttons, external hyperlinks (with a delay), and
 * internal hyperlinks (e.g., using ``Link``).
 */
export const useTrackSearchConversionClickHandler = ({ href, eventName }) => {
  const {
    state: {
      activeCourseRun: { key: courseKey },
      algoliaSearchParams,
    },
  } = useContext(CourseContext);
  const CLICK_DELAY_MS = 300; // 300ms replicates Segment's ``trackLink`` function
  const handleClick = useCallback(
    (e) => {
      const { queryId, objectId } = algoliaSearchParams;
      if (!queryId || !objectId) {
        return;
      }
      // if tracking is on a link with an external href destination, we must intentionally delay the default click
      // behavior to allow enough time for the async analytics event call to resolve.
      if (href) {
        e.preventDefault();
        setTimeout(() => {
          global.location.href = href;
        }, CLICK_DELAY_MS);
      }
      sendTrackEvent(eventName, {
        products: [{ objectID: objectId }],
        index: getConfig().ALGOLIA_INDEX_NAME,
        queryID: queryId,
        courseKey,
      });
    },
    [href, algoliaSearchParams, courseKey, eventName],
  );

  return handleClick;
};
