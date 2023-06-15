import {
  useEffect, useState, useMemo, useContext, useCallback,
} from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import PropTypes from 'prop-types';
import isNil from 'lodash.isnil';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { AppContext } from '@edx/frontend-platform/react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useQuery } from '@tanstack/react-query';

import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests/SubsidyRequestsContextProvider';
import { SUBSIDY_TYPE } from '../../enterprise-subsidy-requests/constants';
import { CourseContext } from '../CourseContextProvider';

import { isDefinedAndNotNull } from '../../../utils/common';
import { features } from '../../../config';
import CourseService from './service';
import {
  isCourseInstructorPaced,
  isCourseSelfPaced,
  findCouponCodeForCourse,
  getSubsidyToApplyForCourse,
  findEnterpriseOfferForCourse,
  getCourseRunPrice,
  getMissingSubsidyReasonActions,
  getCourseOrganizationDetails,
  getCourseStartDate,
} from './utils';
import {
  COURSE_PACING_MAP,
  SUBSIDY_DISCOUNT_TYPE_MAP,
  CURRENCY_USD,
  ENROLLMENT_FAILED_QUERY_PARAM,
  LICENSE_SUBSIDY_TYPE,
  COUPON_CODE_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM,
  DISABLED_ENROLL_USER_MESSAGES,
  DISABLED_ENROLL_REASON_TYPES,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
} from './constants';
import { pushEvent, EVENTS } from '../../../utils/optimizely';
import { getExternalCourseEnrollmentUrl, noAvailableCoupons } from '../enrollment/utils';
import { createExecutiveEducationFailureMessage } from '../../executive-education-2u/ExecutiveEducation2UError';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';

// How long to delay an event, so that we allow enough time for any async analytics event call to resolve
const CLICK_DELAY_MS = 300; // 300ms replicates Segment's ``trackLink`` function

export function useAllCourseData({
  courseService,
  activeCatalogs,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState();
  const [courseRecommendations, setCourseRecommendations] = useState();
  const [courseReviews, setCourseReviews] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (!courseService.courseKey || !courseService.enterpriseUuid) {
        return;
      }
      setIsLoading(true);

      try {
        const data = await courseService.fetchAllCourseData();
        setCourseData(camelCaseObject(data));
      } catch (error) {
        logError(error);
        setFetchError(error);
      }

      try {
        const response = await courseService.fetchCourseReviews();
        setCourseReviews(camelCaseObject(response.data));
      } catch (error) {
        logError(error);
        setCourseReviews(undefined);
      }

      try {
        const data = await courseService.fetchAllCourseRecommendations(activeCatalogs);
        setCourseRecommendations(camelCaseObject(data));
      } catch (error) {
        logError(error);
        setCourseRecommendations([]);
      }

      setIsLoading(false);
    };
    fetchData();
  }, [courseService, activeCatalogs]);
  return {
    courseData,
    courseRecommendations,
    courseReviews,
    fetchError,
    isLoading,
  };
}

// TODO: Refactor away from useEffect useState
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
  }, [config.MARKETING_SITE_BASE_URL, course]);

  return { subjects, primarySubject };
}

// TODO: Refactor away from useEffect useState
export function useCoursePartners(course) {
  const [partners, setPartners] = useState([]);
  const [label, setLabel] = useState('');

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
  let weeksToComplete;
  let label;
  if (courseRun?.weeksToComplete >= 0) {
    weeksToComplete = courseRun.weeksToComplete;
    if (courseRun.weeksToComplete === 1) {
      label = 'week';
    } else {
      label = 'weeks';
    }
  }
  return [weeksToComplete, label];
}

export function useCourseTranscriptLanguages(courseRun) {
  let languages = [];
  let label;
  if (courseRun?.transcriptLanguages) {
    languages = courseRun.transcriptLanguages;
    if (courseRun.transcriptLanguages.length > 1) {
      label = 'Video Transcripts';
    } else {
      label = 'Video Transcript';
    }
  }

  return [languages, label];
}
export function useCoursePacingType(courseRun) {
  let pacingType;
  let pacingTypeContent;

  if (isCourseSelfPaced(courseRun?.pacingType)) {
    pacingType = COURSE_PACING_MAP.SELF_PACED;
  } else if (isCourseInstructorPaced(courseRun?.pacingType)) {
    pacingType = COURSE_PACING_MAP.INSTRUCTOR_PACED;
  }

  if (pacingType === COURSE_PACING_MAP.INSTRUCTOR_PACED) {
    pacingTypeContent = 'Instructor-led on a course schedule';
  } else if (pacingType === COURSE_PACING_MAP.SELF_PACED) {
    pacingTypeContent = 'Self-paced on your time';
  }

  return [pacingType, pacingTypeContent];
}

/**
 * Determines course price based on userSubsidy and course info.
 * @param {object} args Arguments.
 * @param {Object} args.userSubsidyApplicableToCourse User subsidy
 * @param {Object} args.listPrice List price for course
 *
 * @returns {Object} { [{list: number, discounted: number}, currency: string] }
 */
export const useCoursePriceForUserSubsidy = ({
  userSubsidyApplicableToCourse, listPrice,
}) => {
  const currency = CURRENCY_USD;
  const coursePrice = useMemo(
    () => {
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
    [userSubsidyApplicableToCourse, listPrice],
  );

  return [coursePrice, currency];
};

useCoursePriceForUserSubsidy.propTypes = {
  userSubsidyApplicableToCourse: PropTypes.shape({
    discountType: PropTypes.string.isRequired,
    discountValue: PropTypes.number.isRequired,
    expirationDate: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    subsidyId: PropTypes.string.isRequired,
  }).isRequired,
  listPrice: PropTypes.number,
};

/**
 * Get enrollment url for a particular course
 *
 * @param {object} args Arguments.
 * @param {Array.<object>} args.catalogList list of catalogs
 * @param {object} args.enterpriseConfig config for enterprise
 * @param {string} args.courseRunKey id of the course run
 * @param {object} args.location location object from useLocation()
 * @param {string} args.sku course SKU
 * @param {object} args.subscriptionLicense license for subscription | null
 * @param {object} args.userSubsidyApplicableToCourse subsidy for course if found | null
 *
 * @returns {string} url for enrollment
 */
export const useCourseEnrollmentUrl = ({
  enterpriseConfig,
  courseRunKey,
  location,
  sku,
  userSubsidyApplicableToCourse,
  isExecutiveEducation2UCourse,
}) => {
  const routeMatch = useRouteMatch();
  const config = getConfig();
  const baseQueryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    params.set(ENROLLMENT_FAILED_QUERY_PARAM, true);
    params.set(ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM, courseRunKey);
    return params;
  }, [location.search, courseRunKey]);

  const baseEnrollmentOptions = useMemo(
    () => ({
      next: `${config.LMS_BASE_URL}/courses/${courseRunKey}/course`,
      // Redirect back to the same page with a failure query param
      failure_url: `${global.location.origin}${location.pathname}?${baseQueryParams.toString()}`,
    }),
    [config.LMS_BASE_URL, courseRunKey, baseQueryParams, location.pathname],
  );

  // TODO: use the new helper functions (createEnrollWithLicenseUrl, createEnrollWithCouponCodeUrl) to generate url
  const enrollmentUrl = useMemo(
    () => {
      if (userSubsidyApplicableToCourse?.subsidyType === LICENSE_SUBSIDY_TYPE) {
        const queryParams = new URLSearchParams({
          ...baseEnrollmentOptions,
          license_uuid: userSubsidyApplicableToCourse.subsidyId,
          course_id: courseRunKey,
          enterprise_customer_uuid: enterpriseConfig.uuid,
          // We don't want any sidebar text we show the data consent page from this workflow since
          // the text on the sidebar is used when a learner is coming from their employer's system.
          left_sidebar_text_override: '',
          source: 'enterprise-learner-portal',
        });
        return `${config.LMS_BASE_URL}/enterprise/grant_data_sharing_permissions/?${queryParams.toString()}`;
      }

      if (!sku) {
        // No product SKU is present, so the course cannot be enrolled in.
        return null;
      }

      const queryParams = new URLSearchParams({
        ...baseEnrollmentOptions,
        sku,
        consent_url_param_string: `failure_url=${encodeURIComponent(global.location.href)}?${baseQueryParams.toString()}&left_sidebar_text_override=`,
      });

      if (features.ENROLL_WITH_CODES && userSubsidyApplicableToCourse?.subsidyType === COUPON_CODE_SUBSIDY_TYPE) {
        queryParams.set('code', userSubsidyApplicableToCourse.code);
        return `${config.ECOMMERCE_BASE_URL}/coupons/redeem/?${queryParams.toString()}`;
      }

      if (isExecutiveEducation2UCourse) {
        const externalCourseEnrollmentUrl = getExternalCourseEnrollmentUrl({
          currentRouteUrl: routeMatch.url,
        });
        return externalCourseEnrollmentUrl;
      }

      // This enrollment url will automatically apply enterprise offers
      return `${config.ECOMMERCE_BASE_URL}/basket/add/?${queryParams.toString()}`;
    },
    [
      userSubsidyApplicableToCourse,
      sku,
      baseEnrollmentOptions,
      baseQueryParams,
      config.ECOMMERCE_BASE_URL,
      config.LMS_BASE_URL,
      courseRunKey,
      enterpriseConfig.uuid,
      isExecutiveEducation2UCourse,
      routeMatch.url,
    ],
  );

  return enrollmentUrl;
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
  const [algoliaSearchParams, setAlgoliaSearchParams] = useState({});

  const queryParams = useMemo(
    () => new URLSearchParams(search),
    [search],
  );

  useEffect(
    () => {
      if (queryParams.get('queryId') && queryParams.get('objectId')) {
        setAlgoliaSearchParams({
          queryId: queryParams.get('queryId'),
          objectId: queryParams.get('objectId'),
        });
        queryParams.delete('queryId');
        queryParams.delete('objectId');
        history.replace({
          search: queryParams.toString(),
        });
      }
    },
    [history, queryParams],
  );

  return algoliaSearchParams;
};

/**
 * Returns a function to be used as a click handler that emits an analytics event for a
 * search conversion via ``sendEnterpriseTrackEvent``. When used on a hyperlink (i.e., `href` is specified),
 * a imperceivable delay is introduced to allow enough time for analytic event request to resolve.
 *
 * @param {object} args
 * @param {string} [args.href] Optional: If click handler is used on a hyperlink, this is the destination url.
 * @param {string} args.eventName Name of the event
 *
 * @returns Click handler function for clicks on buttons, external hyperlinks (with a delay), and
 * internal hyperlinks (e.g., using ``Link``).
 */
export const useTrackSearchConversionClickHandler = ({ href = undefined, eventName }) => {
  const {
    state: {
      activeCourseRun: { key: courseKey },
      algoliaSearchParams,
    },
  } = useContext(CourseContext);
  const { enterpriseConfig } = useContext(AppContext);
  const handleClick = useCallback(
    (e) => {
      const { queryId, objectId } = algoliaSearchParams;
      // If tracking is on a link with an external href destination, we must intentionally delay the default click
      // behavior to allow enough time for the async analytics event call to resolve.
      if (href) {
        e.preventDefault();
        setTimeout(() => {
          global.location.assign(href);
        }, CLICK_DELAY_MS);
      }
      sendEnterpriseTrackEvent(
        enterpriseConfig.uuid,
        eventName,
        {
          products: [{ objectID: objectId }],
          index: getConfig().ALGOLIA_INDEX_NAME,
          queryID: queryId,
          courseKey,
        },
      );
    },
    [algoliaSearchParams, href, enterpriseConfig, eventName, courseKey],
  );

  return handleClick;
};

/**
 * Returns a function to be used as a click handler that emits an optimizely enrollment click event.
 *
 * @param {string} [args.href] Optional: If click handler is used on a hyperlink, this is the destination url.
 * @param {string} args.courseRunKey Id of the course run
 * @param {string} args.userEnrollments Array of user enrollments
 *
 * @returns Click handler function for clicks on enrollment buttons.
 */
export const useOptimizelyEnrollmentClickHandler = ({ href, courseRunKey, userEnrollments }) => {
  const hasNoExistingEnrollments = userEnrollments?.length === 0 || true;
  const handleClick = useCallback(
    (e) => {
      // If tracking is on a link with an external href destination, we must intentionally delay the default click
      // behavior to allow enough time for the async analytics event call to resolve.
      if (href) {
        e.preventDefault();
        setTimeout(() => {
          global.location.assign(href);
        }, CLICK_DELAY_MS);
      }
      pushEvent(EVENTS.ENROLLMENT_CLICK, { courseKey: courseRunKey });
      if (hasNoExistingEnrollments) {
        pushEvent(EVENTS.FIRST_ENROLLMENT_CLICK, { courseKey: courseRunKey });
      }
    },
    [courseRunKey, hasNoExistingEnrollments, href],
  );

  return handleClick;
};

/**
 * Returns `true` if user has made a subsidy request.
 *
 * Returns `false` if:
 *  - Subsidy request has not been configured
 *  - No requests are found under the configured `SUBSIDY_TYPE`
 *
 * If the `SUBSIDY_TYPE` is `COUPON`, optional parameter courseKey can be passed
 * to only return true if courseKey is in one of the requests
 *
 * @param {string} [courseKey] - optional filter for specific course
 * @returns {boolean}
 */
export function useUserHasSubsidyRequestForCourse(courseKey) {
  const {
    subsidyRequestConfiguration,
    requestsBySubsidyType,
  } = useContext(SubsidyRequestsContext);

  return useMemo(() => {
    if (!subsidyRequestConfiguration?.subsidyRequestsEnabled) {
      return false;
    }
    switch (subsidyRequestConfiguration.subsidyType) {
      case SUBSIDY_TYPE.LICENSE: {
        return requestsBySubsidyType[SUBSIDY_TYPE.LICENSE].length > 0;
      }
      case SUBSIDY_TYPE.COUPON: {
        const foundCouponRequest = requestsBySubsidyType[SUBSIDY_TYPE.COUPON].find(
          request => (!courseKey || request.courseId === courseKey),
        );
        return !!foundCouponRequest;
      }
      default:
        return false;
    }
  }, [
    courseKey,
    subsidyRequestConfiguration,
    requestsBySubsidyType,
  ]);
}

/**
 * Calls the can-redeem API endpoint in the enterprise-access service to determine if the user is eligible to redeem
 * the course runs for the course being viewed.
 *
 * @param {object} args
 * @param {string} args.enterpriseUuid The UUID of the enterprise customer
 * @param {string} args.activeCourseRunKey The advertised course run key, e.g. 'course-v1:edX+DemoX+Demo_Course'
 * @param {string} args.queryKey Query key for the call to `useQuery`, used to pass in the course run keys.
 *
 * @returns {object} {
 *  isPolicyRedemptionEnabled,
 *  redeemabilityPerContentKey,
 *  redeemableSubsidyAccessPolicy,
 *  missingSubsidyAccessPolicyReason
 * }
 */
const checkRedemptionEligibility = async ({ queryKey }) => {
  const enterpriseUuid = queryKey[1];
  const { courseRunKeys, activeCourseRunKey } = queryKey[3];

  const courseService = new CourseService({ enterpriseUuid });
  const response = await courseService.fetchCanRedeem({ courseRunKeys });
  const transformedResponse = camelCaseObject(response.data);
  const redeemabilityForActiveCourseRun = transformedResponse.find(r => r.contentKey === activeCourseRunKey);
  const missingSubsidyAccessPolicyReason = redeemabilityForActiveCourseRun?.reasons[0];
  const preferredSubsidyAccessPolicy = redeemabilityForActiveCourseRun?.redeemableSubsidyAccessPolicy;
  const otherSubsidyAccessPolicy = transformedResponse.find(
    r => r.redeemableSubsidyAccessPolicy,
  )?.redeemableSubsidyAccessPolicy;

  const hasSuccessfulRedemption = transformedResponse.some(r => r.hasSuccessfulRedemption);

  // If there is a redeemable subsidy access policy for the active course run, use that. Otherwise, use any other
  // redeemable subsidy access policy for any of the content keys.
  const redeemableSubsidyAccessPolicy = preferredSubsidyAccessPolicy || otherSubsidyAccessPolicy;
  const isPolicyRedemptionEnabled = hasSuccessfulRedemption || !!redeemableSubsidyAccessPolicy;

  return {
    isPolicyRedemptionEnabled,
    redeemabilityPerContentKey: transformedResponse,
    redeemableSubsidyAccessPolicy,
    missingSubsidyAccessPolicyReason,
    hasSuccessfulRedemption,
  };
};

/**
 * Makes an API request to enterprise-access's `can-redeem` endpoint to return
 * a redeemable subsidy, if any, for each course run key provided.
 *
 * @param {object} args
 * @param {array} args.courseRunKeys List of course run keys.
 * @param {string} args.activeCourseRunKey The course run key of the advertised course run for the top-level course.
 * @param {string} args.enterpriseUuid Enterprise customer UUID.
 * @param {string} args.isQueryEnabled Whether the API request to ``can-redeem`` should be made
 * @param {string} args.queryOptions Optional query options to pass to `useQuery`
 *
 * @returns {object} The output from `useQuery`, plus the following:
 * - `isPolicyRedemptionEnabled`: Whether there is a redeemable subsidy access policy.
 * - `redeemableSubsidyAccessPolicy`: The redeemable subsidy access policy, if any.
 * - `redeemabilityPerContentKey`: An array of objects containing the redeemability status for each course run key.
 * - `missingSubsidyAccessPolicyReason`: The reason why the subsidy access policy is not redeemable, if any.
 */
export const useCheckSubsidyAccessPolicyRedeemability = ({
  courseRunKeys = [],
  activeCourseRunKey,
  enterpriseUuid,
  isQueryEnabled,
  queryOptions,
}) => {
  const { id: lmsUserId } = getAuthenticatedUser();
  const isEnabled = !!(isQueryEnabled && activeCourseRunKey && courseRunKeys.length > 0);
  return useQuery({
    ...queryOptions,
    queryKey: ['policy', enterpriseUuid, 'can-redeem', { lmsUserId, courseRunKeys, activeCourseRunKey }],
    enabled: isEnabled,
    queryFn: checkRedemptionEligibility,
  });
};

/**
 * Given the state of a user's redeemable subsidy access policy and/or other subsidies, determine
 * which subsidy, if any, is applicable to the course.
 *
 * Returns:
 * {
 *  userSubsidyApplicableToCourse: null,
 *  missingUserSubsidyReason: null,
 * }
 *
 * @param {object} args
 * @param {object} args.courseData Metadata about the course.
 * @param {object} args.redeemableSubsidyAccessPolicy Metadata about the redeemability subsidy access policy, if any.
 * @param {boolean} args.isPolicyRedemptionEnabled Whether there is a redeemable subsidy access policy.
 * @param {object} args.subscriptionLicense Metadata pertaining to learner's subscription license, if any.
 * @param {object} args.courseService Instance of the CourseService.
 * @param {array} args.couponCodes List of assigned coupon codes, if any.
 * @param {boolean} args.canEnrollWithEnterpriseOffers Whether enterprise offers are usable for the enterprise.
 * @param {array} args.enterpriseOffers List of enterprise offers, if any.
 * @param {function} args.onSubscriptionLicenseForCourseValidationError Callback to handle subscription
 *  license validation error.
 *
 * @returns A subsidy that may be redeemed for the course.
 */
export const useUserSubsidyApplicableToCourse = ({
  courseData,
  redeemableSubsidyAccessPolicy,
  isPolicyRedemptionEnabled,
  subscriptionLicense,
  courseService,
  couponCodes,
  couponsForSubsidyRequests,
  canEnrollWithEnterpriseOffers,
  enterpriseOffers,
  onSubscriptionLicenseForCourseValidationError,
  missingSubsidyAccessPolicyReason,
  enterpriseAdminUsers: fallbackAdminUsers,
  courseListPrice,
  customerAgreementConfig,
}) => {
  const [userSubsidyApplicableToCourse, setUserSubsidyApplicableToCourse] = useState();
  const [missingUserSubsidyReason, setMissingUserSubsidyReason] = useState();

  useEffect(() => {
    if (!courseData) {
      return;
    }

    const {
      catalog: {
        containsContentItems,
        catalogList: catalogsWithCourse,
      },
      courseDetails,
    } = courseData;

    let applicableUserSubsidy;

    // if course can be redeemed with a subsidy access policy, return `learnerCredit` subsidy type.
    if (isPolicyRedemptionEnabled) {
      // the enterprise-access `can-redeem` API returns `can_redeem: false` when a learner
      // has already redeemed a course. This means the course page thinks the learner no
      // longer has any subsidy available to spend. `isPolicyRedemptionEnabled` is true when
      // `can_redeem: false && has_successful_redemption: true`, so `redeemableSubsidyAccessPolicy` may now be null.
      applicableUserSubsidy = {
        discountType: 'percentage',
        discountValue: 100,
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
        perLearnerEnrollmentLimit: redeemableSubsidyAccessPolicy?.perLearnerEnrollmentLimit,
        perLearnerSpendLimit: redeemableSubsidyAccessPolicy?.perLearnerSpendLimit,
        policyRedemptionUrl: redeemableSubsidyAccessPolicy?.policyRedemptionUrl,
      };
    }

    // otherwise, fallback to existing legacy subsidies.
    const retrieveApplicableLegacySubsidy = async () => {
      // course isn't contained in any catalog(s), so there is no applicable user subsidy; do nothing
      if (!containsContentItems) {
        return undefined;
      }
      let licenseApplicableToCourse;
      if (subscriptionLicense) {
        try {
          // get subscription license with extra information (i.e. discount type, discount value, subsidy checksum)
          const fetchLicenseSubsidyResponse = await courseService.fetchUserLicenseSubsidy();
          if (fetchLicenseSubsidyResponse) {
            licenseApplicableToCourse = camelCaseObject(fetchLicenseSubsidyResponse.data);
          }
        } catch (error) {
          logError(error);
          if (onSubscriptionLicenseForCourseValidationError) {
            onSubscriptionLicenseForCourseValidationError(error);
          }
        }
        return licenseApplicableToCourse;
      }
      const coursePrice = getCourseRunPrice({
        courseDetails,
        firstEnrollablePaidSeatPrice: courseService?.activeCourseRun?.firstEnrollablePaidSeatPrice,
      });
      return getSubsidyToApplyForCourse({
        applicableSubscriptionLicense: licenseApplicableToCourse,
        applicableCouponCode: findCouponCodeForCourse(couponCodes, catalogsWithCourse),
        applicableEnterpriseOffer: findEnterpriseOfferForCourse({
          enterpriseOffers: canEnrollWithEnterpriseOffers ? enterpriseOffers : [],
          catalogsWithCourse,
          coursePrice,
        }),
      });
    };

    const enterpriseAdminUsers = (
      missingSubsidyAccessPolicyReason?.metadata?.enterpriseAdministrators
      || fallbackAdminUsers
    );

    const handleMissingUserSubsidyReason = () => {
      setUserSubsidyApplicableToCourse(undefined);

      if (missingSubsidyAccessPolicyReason) {
        setMissingUserSubsidyReason({
          reason: missingSubsidyAccessPolicyReason.reason,
          userMessage: missingSubsidyAccessPolicyReason.userMessage,
          actions: getMissingSubsidyReasonActions({
            reasonType: missingSubsidyAccessPolicyReason.reason,
            enterpriseAdminUsers,
          }),
        });
      } else if (!applicableUserSubsidy) {
        let reasonType = DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS;
        if (enterpriseAdminUsers?.length > 0) {
          reasonType = DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY;
        }
        if (subscriptionLicense?.status === LICENSE_STATUS.REVOKED) {
          reasonType = DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED;
        }
        const hasExpiredSubscriptions = customerAgreementConfig?.subscriptions?.every(
          (sub) => sub.daysUntilExpiration < 0,
        );
        if (hasExpiredSubscriptions) {
          reasonType = DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED;
        }
        const hasNoEnrollmentCodesRemaining = noAvailableCoupons(couponsForSubsidyRequests);
        if (hasNoEnrollmentCodesRemaining) {
          reasonType = DISABLED_ENROLL_REASON_TYPES.NO_ENROLLMENT_CODES_REMAINING;
        }
        // set reason type as content not in catalog if course is contained
        // within any of the enterprise customer's catalog(s).
        if (!containsContentItems) {
          reasonType = DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG;
        }
        setMissingUserSubsidyReason({
          reason: reasonType,
          userMessage: DISABLED_ENROLL_USER_MESSAGES[reasonType],
          actions: getMissingSubsidyReasonActions({
            reasonType,
            enterpriseAdminUsers,
          }),
        });
      }
    };

    if (applicableUserSubsidy) {
      setUserSubsidyApplicableToCourse(applicableUserSubsidy);
      setMissingUserSubsidyReason(undefined);
    } else {
      // If have not yet determined whether there is an applicable subsidy access policy, fallback
      // to checking against legacy subsidies.
      retrieveApplicableLegacySubsidy().then((legacyUserSubsidyApplicableToCourse) => {
        if (legacyUserSubsidyApplicableToCourse) {
          // check for exceeded remaining spend/enrollments and per-learner limits if it's an enterprise offer
          if (legacyUserSubsidyApplicableToCourse.subsidyType === ENTERPRISE_OFFER_SUBSIDY_TYPE) {
            const {
              remainingBalance,
              remainingBalanceForUser,
              remainingApplications,
              remainingApplicationsForUser,
            } = legacyUserSubsidyApplicableToCourse;

            const hasBalanceRemainingForUser = (
              !isNil(remainingBalanceForUser) ? remainingBalanceForUser > courseListPrice : true
            );
            const hasRemainingApplicationsForUser = (
              !isNil(remainingApplicationsForUser) ? remainingApplicationsForUser > 0 : true
            );
            const hasBalanceRemaining = !isNil(remainingBalance) ? remainingBalance > courseListPrice : true;
            const hasRemainingApplications = !isNil(remainingApplications) ? remainingApplications > 0 : true;

            const redeemableOfferConditions = [
              hasBalanceRemainingForUser,
              hasRemainingApplicationsForUser,
              hasBalanceRemaining,
              hasRemainingApplications,
            ];

            if (redeemableOfferConditions.every(offerCondition => offerCondition)) {
              // Redeemable for this course
              setUserSubsidyApplicableToCourse(legacyUserSubsidyApplicableToCourse);
              setMissingUserSubsidyReason(undefined);
            } else {
              let ineligibleEnterpriseOfferReasonType = DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY;
              if (!hasRemainingApplicationsForUser) {
                ineligibleEnterpriseOfferReasonType = DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_ENROLLMENTS_REACHED;
              }
              if (!hasBalanceRemainingForUser) {
                ineligibleEnterpriseOfferReasonType = DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED;
              }
              setMissingUserSubsidyReason({
                reason: ineligibleEnterpriseOfferReasonType,
                userMessage: DISABLED_ENROLL_USER_MESSAGES[ineligibleEnterpriseOfferReasonType],
                actions: getMissingSubsidyReasonActions({
                  reasonType: ineligibleEnterpriseOfferReasonType,
                  enterpriseAdminUsers,
                }),
              });
            }
          } else {
            setUserSubsidyApplicableToCourse(legacyUserSubsidyApplicableToCourse);
            setMissingUserSubsidyReason(undefined);
          }
        } else {
          handleMissingUserSubsidyReason();
        }
      });
    }
  }, [
    courseService,
    courseData,
    courseListPrice,
    onSubscriptionLicenseForCourseValidationError,
    subscriptionLicense,
    couponCodes,
    couponsForSubsidyRequests,
    canEnrollWithEnterpriseOffers,
    enterpriseOffers,
    redeemableSubsidyAccessPolicy,
    isPolicyRedemptionEnabled,
    missingSubsidyAccessPolicyReason,
    fallbackAdminUsers,
    customerAgreementConfig?.subscriptions,
  ]);

  return useMemo(() => ({
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
  }), [userSubsidyApplicableToCourse, missingUserSubsidyReason]);
};

export const useMinimalCourseMetadata = () => {
  const {
    state: {
      activeCourseRun,
      course,
    },
    coursePrice,
    currency,
  } = useContext(CourseContext);
  const organizationDetails = getCourseOrganizationDetails(course);

  const getDuration = () => {
    if (!activeCourseRun) {
      return '-';
    }
    let duration = `${activeCourseRun.weeksToComplete} Week`;
    if (activeCourseRun.weeksToComplete > 1) {
      duration += 's';
    }
    return duration;
  };

  const courseMetadata = {
    organizationImage: organizationDetails.organizationLogo,
    organizationName: organizationDetails.organizationName,
    title: course.title,
    startDate: getCourseStartDate({ contentMetadata: course, courseRun: activeCourseRun }),
    duration: getDuration(),
    priceDetails: {
      price: coursePrice.list,
      currency,
    },
  };
  return courseMetadata;
};

export const useExternalEnrollmentFailureReason = () => {
  const intl = useIntl();
  const {
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
    hasSuccessfulRedemption,
  } = useContext(CourseContext);
  return useMemo(() => {
    if (userSubsidyApplicableToCourse || hasSuccessfulRedemption) {
      return {};
    }
    let reason;
    const noSubsidyReasons = [
      DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS,
      DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
      DISABLED_ENROLL_REASON_TYPES.POLICY_NOT_ACTIVE,
    ];
    const systemErrorReasons = [
      DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
      DISABLED_ENROLL_REASON_TYPES.LEARNER_NOT_IN_ENTERPRISE,
    ];
    if (!missingUserSubsidyReason || noSubsidyReasons.includes(missingUserSubsidyReason?.reason)) {
      reason = 'no_offer_available';
    } else if (missingUserSubsidyReason.reason === DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY) {
      reason = 'no_offer_with_enough_balance';
    } else if (missingUserSubsidyReason.reason === DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_ENROLLMENTS_REACHED) {
      reason = 'no_offer_with_remaining_applications';
    } else if (missingUserSubsidyReason.reason === DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED) {
      reason = 'no_offer_with_enough_user_balance';
    } else if (systemErrorReasons.includes(missingUserSubsidyReason.reason)) {
      reason = 'system_error';
    }
    return {
      failureReason: reason,
      failureMessage: createExecutiveEducationFailureMessage({ failureCode: reason, intl }),
    };
  }, [
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
    intl,
    hasSuccessfulRedemption,
  ]);
};
