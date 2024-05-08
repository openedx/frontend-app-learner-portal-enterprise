import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import { isDefinedAndNotNull } from '../../../utils/common';
import { features } from '../../../config';

import {
  createEnrollWithCouponCodeUrl,
  createEnrollWithLicenseUrl,
  findCouponCodeForCourse,
  findEnterpriseOfferForCourse,
  getCourseOrganizationDetails,
  getCoursePrice,
  getCourseTypeConfig,
  getMissingApplicableSubsidyReason,
  getSubsidyToApplyForCourse,
  isCourseInstructorPaced,
  isCourseSelfPaced,
  transformedCourseMetadata,
} from './utils';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  COURSE_PACING_MAP,
  CURRENCY_USD,
  DISABLED_ENROLL_REASON_TYPES,
  ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM,
  ENROLLMENT_FAILED_QUERY_PARAM,
  LICENSE_SUBSIDY_TYPE,
  SUBSIDY_DISCOUNT_TYPE_MAP,
} from './constants';
import { EVENTS, pushEvent } from '../../../utils/optimizely';
import { canUserRequestSubsidyForCourse, getExternalCourseEnrollmentUrl } from '../enrollment/utils';
import { createExecutiveEducationFailureMessage } from '../../executive-education-2u/ExecutiveEducation2UError';
import { SUBSIDY_TYPE } from '../../../constants';
import {
  useBrowseAndRequest,
  useBrowseAndRequestConfiguration,
  useCatalogsForSubsidyRequests,
  useCouponCodes,
  useCourseMetadata,
  useCourseRedemptionEligibility,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContent,
  useEnterpriseOffers,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../app/data';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { CourseContext } from '../CourseContextProvider';

// How long to delay an event, so that we allow enough time for any async analytics event call to resolve
const CLICK_DELAY_MS = 300; // 300ms replicates Segment's ``trackLink`` function

/**
 * Determines the course partners associated with the course. Checks whether
 * it should use the organization override or the `owners` property based on
 * the course type configuration.
 *
 * @param {Object} course Metadata about the course.
 *
 * @returns {Array} An array of partners and a label for the partners, e.g. `[[{ name: 'edX' }], 'Institution']`.
 */
export function useCoursePartners(course) {
  const partners = [];
  const intl = useIntl();
  let label = intl.formatMessage({
    id: 'enterprise.course.about.course.sidebar.institution',
    defaultMessage: 'Institution',
    description: 'Label for the institution associated with the course.',
  });

  // Determine whether this course should use the organization override (e.g., for some
  // externally hosted courses) instead of relying on the `owners` property.
  const courseTypeConfig = getCourseTypeConfig(course);
  const usesOrganizationOverride = courseTypeConfig?.usesOrganizationOverride;
  if (usesOrganizationOverride) {
    const orgDetails = getCourseOrganizationDetails(course);
    const result = [
      [{
        uuid: orgDetails.organizationUuid,
        key: orgDetails.organizationKey,
        name: orgDetails.organizationName,
        logoImageUrl: orgDetails.organizationLogo,
        marketingUrl: orgDetails.organizationMarketingUrl,
      }],
      label,
    ];
    return result;
  }

  // If the course type does not have a configuration to use the organization override described above,
  // fallback to relying on the `owners` property for regular Open edX courses.
  if (course?.owners) {
    course.owners.forEach((owner) => {
      partners.push(owner);
    });
    if (course.owners.length > 1) {
      label = intl.formatMessage({
        id: 'enterprise.course.about.course.sidebar.institutions',
        defaultMessage: 'Institutions',
        description: 'Label for the institutions associated with the course.',
      });
    }
  }
  return [partners, label];
}

export function useCourseRunWeeksToComplete(courseRun) {
  let weeksToComplete;
  let label;
  const intl = useIntl();
  if (courseRun?.weeksToComplete >= 0) {
    weeksToComplete = courseRun.weeksToComplete;
    label = intl.formatMessage({
      id: 'enterprise.course.about.course.sidebar.weeks',
      defaultMessage: '{weeksCount, plural, one {week} other {weeks}}',
      description: 'Label for the number of weeks it takes to complete the course.',
    }, { weeksCount: weeksToComplete });
  }
  return [weeksToComplete, label];
}

export function useCourseTranscriptLanguages(courseRun) {
  let languages = [];
  let label;
  const intl = useIntl();
  if (courseRun?.transcriptLanguages) {
    languages = courseRun.transcriptLanguages;
    label = intl.formatMessage({
      id: 'enterprise.course.about.course.sidebar.transcript',
      defaultMessage: 'Video {transcriptCount, plural, one {Transcript} other {Transcripts}}',
      description: 'Label for the number of transcripts available for the course.',
    }, { transcriptCount: languages.length });
  }

  return [languages, label];
}

export function useCoursePacingType(courseRun) {
  let pacingType;
  let pacingTypeContent;
  const intl = useIntl();

  if (isCourseSelfPaced(courseRun?.pacingType)) {
    pacingType = COURSE_PACING_MAP.SELF_PACED;
  } else if (isCourseInstructorPaced(courseRun?.pacingType)) {
    pacingType = COURSE_PACING_MAP.INSTRUCTOR_PACED;
  }

  if (pacingType === COURSE_PACING_MAP.INSTRUCTOR_PACED) {
    pacingTypeContent = intl.formatMessage({
      id: 'enterprise.course.about.course.sidebar.instructor.paced',
      defaultMessage: 'Instructor-led on a course schedule',
      description: 'Label for instructor-paced course pacing type.',
    });
  } else if (pacingType === COURSE_PACING_MAP.SELF_PACED) {
    pacingTypeContent = intl.formatMessage({
      id: 'enterprise.course.about.course.sidebar.self.paced',
      defaultMessage: 'Self-paced on your time',
      description: 'Label for self-paced course pacing type.',
    });
  }

  return [pacingType, pacingTypeContent];
}

/**
 * @typedef {Object} CoursePrice
 * @property {number} list The list price.
 * @property {number} discounted The discounted price.
 */

/**
 * @typedef {Object} useCoursePriceForUserSubsidyResult
 * @property {CoursePrice} coursePrice The course price.
 * @property {string} currency The currency code.
 */

/**
 * Determines course price based on userSubsidy and course info.
 * @param {Object} args Arguments.
 * @param {Object} args.userSubsidyApplicableToCourse User subsidy
 * @param {Object} args.listPrice List price for course
 *
 * @returns {useCoursePriceForUserSubsidyResult} The course price and currency.
 */
export const useCoursePriceForUserSubsidy = ({
  userSubsidyApplicableToCourse,
  listPrice,
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

        if (discountType && discountType.toLowerCase() === SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toLowerCase()) {
          discountedPrice = listPrice - (listPrice * (discountValue / 100));
        }

        if (discountType && discountType.toLowerCase() === SUBSIDY_DISCOUNT_TYPE_MAP.ABSOLUTE.toLowerCase()) {
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

  return useMemo(() => ({
    coursePrice,
    currency,
  }), [coursePrice, currency]);
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
 * @param {object} args.enterpriseCustomer config for enterprise
 * @param {string} args.courseRunKey id of the course run
 * @param {object} args.location location object from useLocation()
 * @param {string} args.sku course SKU
 * @param {object} args.subscriptionLicense license for subscription | null
 * @param {object} args.userSubsidyApplicableToCourse subsidy for course if found | null
 *
 * @returns {string} url for enrollment
 */
export const useCourseEnrollmentUrl = ({
  enterpriseCustomer,
  courseRunKey,
  location,
  sku,
  userSubsidyApplicableToCourse,
  isExecutiveEducation2UCourse,
}) => {
  const { pathname } = useLocation();
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

  const enrollmentUrl = useMemo(
    () => {
      if (userSubsidyApplicableToCourse?.subsidyType === LICENSE_SUBSIDY_TYPE) {
        return createEnrollWithLicenseUrl({
          courseRunKey,
          enterpriseId: enterpriseCustomer.uuid,
          licenseUUID: userSubsidyApplicableToCourse.subsidyId,
          location,
        });
      }

      if (!sku) {
        // No product SKU is present, so the course cannot be enrolled in.
        return null;
      }

      if (features.ENROLL_WITH_CODES && userSubsidyApplicableToCourse?.subsidyType === COUPON_CODE_SUBSIDY_TYPE) {
        return createEnrollWithCouponCodeUrl({
          courseRunKey,
          sku,
          code: userSubsidyApplicableToCourse.code,
          location,
        });
      }

      if (isExecutiveEducation2UCourse) {
        const externalCourseEnrollmentUrl = getExternalCourseEnrollmentUrl({
          currentRouteUrl: pathname,
          selectedCourseRunKey: courseRunKey,
        });
        return externalCourseEnrollmentUrl;
      }
      const queryParams = new URLSearchParams({
        ...baseEnrollmentOptions,
        sku,
        consent_url_param_string: `failure_url=${encodeURIComponent(global.location.href)}?${baseQueryParams.toString()}&left_sidebar_text_override=`,
      });
      // This enrollment url will automatically apply enterprise offers
      return `${config.ECOMMERCE_BASE_URL}/basket/add/?${queryParams.toString()}`;
    },
    [
      userSubsidyApplicableToCourse,
      sku,
      baseEnrollmentOptions,
      baseQueryParams,
      config.ECOMMERCE_BASE_URL,
      courseRunKey,
      enterpriseCustomer.uuid,
      isExecutiveEducation2UCourse,
      pathname,
      location,
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
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
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
        navigate(pathname, {
          search: queryParams.toString(),
          replace: true,
        });
      }
    },
    [navigate, queryParams, pathname],
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
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: { activeCourseRun } } = useCourseMetadata();
  const {
    algoliaSearchParams,
  } = useContext(CourseContext);
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
        enterpriseCustomer.uuid,
        eventName,
        {
          products: [{ objectID: objectId }],
          index: getConfig().ALGOLIA_INDEX_NAME,
          queryID: queryId,
          courseKey: activeCourseRun.key,
        },
      );
    },
    [algoliaSearchParams, href, enterpriseCustomer.uuid, eventName, activeCourseRun.key],
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
  const hasNoExistingEnrollments = !userEnrollments || userEnrollments.length === 0;
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
    data: {
      configuration: browseAndRequestConfiguration,
      requests: {
        subscriptionLicenses: subscriptionLicenseRequests,
        couponCodes: couponCodeRequests,
      },
    },
  } = useBrowseAndRequest();
  if (!browseAndRequestConfiguration?.subsidyRequestsEnabled) {
    return false;
  }
  switch (browseAndRequestConfiguration.subsidyType) {
    case SUBSIDY_TYPE.LICENSE: {
      return subscriptionLicenseRequests.length > 0;
    }
    case SUBSIDY_TYPE.COUPON: {
      const foundCouponRequest = couponCodeRequests.find(
        request => (!courseKey || request.courseId === courseKey),
      );
      return !!foundCouponRequest;
    }
    default:
      return false;
  }
}

export function useCourseListPrice() {
  const { data: { listPrice } } = useCourseRedemptionEligibility();
  const resolveListPrice = ({ transformed }) => listPrice || getCoursePrice(transformed);
  return useCourseMetadata({
    select: resolveListPrice,
  });
}

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
 * @returns A subsidy that may be redeemed for the course.
 */
export const useUserSubsidyApplicableToCourse = () => {
  const { courseKey } = useParams();
  const resolvedTransformedEnterpriseCustomerData = ({ transformed }) => ({
    fallbackAdminUsers: transformed.adminUsers.map(user => user.email),
    contactEmail: transformed.contactEmail,
  });
  const {
    data: {
      fallbackAdminUsers,
      contactEmail,
    },
  } = useEnterpriseCustomer({
    select: resolvedTransformedEnterpriseCustomerData,
  });
  const { data: courseListPrice } = useCourseListPrice();
  const {
    data: {
      customerAgreement,
      subscriptionLicense,
      subscriptionPlan,
    },
  } = useSubscriptions();
  const {
    data: {
      containsContentItems,
      catalogList: catalogsWithCourse,
    },
  } = useEnterpriseCustomerContainsContent([courseKey]);
  const {
    data: {
      enterpriseOffers,
      currentEnterpriseOffers,
    },
  } = useEnterpriseOffers();
  const {
    data: {
      isPolicyRedemptionEnabled,
      redeemableSubsidyAccessPolicy,
      missingSubsidyAccessPolicyReason,
    },
  } = useCourseRedemptionEligibility();
  const {
    data: {
      couponCodeAssignments,
      couponsOverview,
    },
  } = useCouponCodes();

  const isSubscriptionLicenseApplicable = (
    subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED
    && subscriptionLicense?.subscriptionPlan.isCurrent
    && catalogsWithCourse.includes(subscriptionPlan?.enterpriseCatalogUuid)
  );
  const userSubsidyApplicableToCourse = getSubsidyToApplyForCourse({
    applicableSubscriptionLicense: isSubscriptionLicenseApplicable ? subscriptionLicense : null,
    applicableSubsidyAccessPolicy: { isPolicyRedemptionEnabled, redeemableSubsidyAccessPolicy },
    applicableCouponCode: findCouponCodeForCourse(couponCodeAssignments, catalogsWithCourse),
    applicableEnterpriseOffer: findEnterpriseOfferForCourse({
      enterpriseOffers: currentEnterpriseOffers,
      catalogsWithCourse,
      coursePrice: courseListPrice,
    }),
  });
  console.log(userSubsidyApplicableToCourse);
  let missingUserSubsidyReason;
  if (!userSubsidyApplicableToCourse) {
    const enterpriseAdminUsers = (
      missingSubsidyAccessPolicyReason?.metadata?.enterpriseAdministrators || fallbackAdminUsers
    );
    missingUserSubsidyReason = getMissingApplicableSubsidyReason({
      enterpriseAdminUsers,
      contactEmail,
      catalogsWithCourse,
      couponCodes: couponCodeAssignments,
      couponsOverview,
      customerAgreement,
      subscriptionLicense,
      containsContentItems,
      missingSubsidyAccessPolicyReason,
      enterpriseOffers,
    });
  }
  console.log(missingUserSubsidyReason);
  return useMemo(() => ({
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
  }), [userSubsidyApplicableToCourse, missingUserSubsidyReason]);
};

/**
 * Determines the course price based on the list price from the course metadata
 * and the user's redeemable subsidy access policy, if any.
 *
 * @returns {useCoursePriceForUserSubsidyResult} The course price and currency.
*/
export function useCoursePrice() {
  const { data: courseListPrice } = useCourseListPrice();
  const { userSubsidyApplicableToCourse } = useUserSubsidyApplicableToCourse();
  return useCoursePriceForUserSubsidy({
    userSubsidyApplicableToCourse,
    listPrice: courseListPrice,
  });
}

/**
 * Determines the enterprise catalog(s) applicable to the course for browse and request.
 * @returns {Set} A set of catalog UUIDs that contain the course.
 */
export function useBrowseAndRequestCatalogsApplicableToCourse() {
  const { courseKey } = useParams();
  const catalogsForSubsidyRequests = useCatalogsForSubsidyRequests();
  const { data: { catalogList: catalogsContainingCourse } } = useEnterpriseCustomerContainsContent([courseKey]);
  const catalogsApplicableToCourse = useMemo(() => {
    const subsidyRequestCatalogIntersection = new Set(
      catalogsForSubsidyRequests.filter(catalog => catalogsContainingCourse.includes(catalog)),
    );
    return Array.from(subsidyRequestCatalogIntersection);
  }, [catalogsContainingCourse, catalogsForSubsidyRequests]);
  return catalogsApplicableToCourse;
}

export function useCanUserRequestSubsidyForCourse() {
  const { data: browseAndRequestConfiguration } = useBrowseAndRequestConfiguration();
  const subsidyRequestCatalogsApplicableToCourse = useBrowseAndRequestCatalogsApplicableToCourse();
  const { userSubsidyApplicableToCourse } = useUserSubsidyApplicableToCourse();
  return canUserRequestSubsidyForCourse({
    subsidyRequestConfiguration: browseAndRequestConfiguration,
    subsidyRequestCatalogsApplicableToCourse,
    userSubsidyApplicableToCourse,
  });
}

/**
 * Use "minimal" metadata about a specific course run.
 *
 * The run is determined by first checking the URL Param "courseRunKey", then falling back to the "active" run.
 *
 * @returns {Object} - The minimal metadata object about the course run.
 */
export function useMinimalCourseMetadata() {
  const { courseRunKey } = useParams();
  const { coursePrice, currency } = useCoursePrice();
  const courseMetadataTransformer = ({ transformed }) => transformedCourseMetadata({
    transformed,
    coursePrice,
    courseRunKey,
    currency,
  });
  return useCourseMetadata({
    select: courseMetadataTransformer,
  });
}

export const useExternalEnrollmentFailureReason = () => {
  const intl = useIntl();
  const { userSubsidyApplicableToCourse, missingUserSubsidyReason } = useUserSubsidyApplicableToCourse();
  const { data: { hasSuccessfulRedemption } } = useCourseRedemptionEligibility();
  return useMemo(() => {
    if (userSubsidyApplicableToCourse || hasSuccessfulRedemption) {
      return {};
    }
    let reason;
    const noSubsidyReasons = [
      DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS,
      DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
      DISABLED_ENROLL_REASON_TYPES.POLICY_NOT_ACTIVE,
      DISABLED_ENROLL_REASON_TYPES.SUBSIDY_NOT_ACTIVE,
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

/**
 * Checks if a course is assigned to a learner based on their allocated content assignments.
 *
 * @param {Object} learnerContentAssignments - The content assignments of the learner.
 * @param {string} courseKey - The key of the course to check.
 * @returns {boolean} - Returns true if the course is assigned to the learner, false otherwise.
 */
export const useIsCourseAssigned = () => {
  const { data: { learnerContentAssignments } } = useRedeemablePolicies();
  const { data: courseMetadata } = useCourseMetadata();
  if (!learnerContentAssignments.hasAllocatedAssignments) {
    return false;
  }
  const isCourseAssigned = learnerContentAssignments.allocatedAssignments.some(
    (assignment) => assignment.contentKey === courseMetadata.key,
  );
  return isCourseAssigned;
};
