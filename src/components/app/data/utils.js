import dayjs from 'dayjs';
import { logError } from '@edx/frontend-platform/logging';
import { getLocale } from '@edx/frontend-platform/i18n';
import { POLICY_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import {
  getBrandColorsFromCSSVariables,
  hasValidStartExpirationDates,
  isDefinedAndNotNull,
  isTodayBetweenDates,
  isTodayWithinDateThreshold,
} from '../../../utils/common';
import { COURSE_STATUSES, SUBSIDY_TYPE } from '../../../constants';
import { LATE_ENROLLMENTS_BUFFER_DAYS } from '../../../config/constants';
import {
  ASSIGNMENT_TYPES,
  COUPON_CODE_SUBSIDY_TYPE,
  COURSE_AVAILABILITY_MAP,
  COURSE_MODES_MAP,
  ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
} from './constants';
import { features } from '../../../config';

/**
 * Check if system maintenance alert is open, based on configuration.
 * @param {Object} config
 * @returns {boolean}
 */
export function isSystemMaintenanceAlertOpen(config) {
  if (!config) {
    return false;
  }
  const isEnabledWithMessage = (
    config.IS_MAINTENANCE_ALERT_ENABLED && config.MAINTENANCE_ALERT_MESSAGE
  );
  if (!isEnabledWithMessage) {
    return false;
  }
  const startTimestamp = config.MAINTENANCE_ALERT_START_TIMESTAMP;
  const endTimestamp = config.MAINTENANCE_ALERT_END_TIMESTAMP;
  if (startTimestamp && endTimestamp) {
    return isTodayBetweenDates({ startDate: startTimestamp, endDate: endTimestamp });
  }
  if (startTimestamp) {
    return dayjs().isAfter(dayjs(startTimestamp));
  }
  if (endTimestamp) {
    return dayjs().isBefore(dayjs(endTimestamp));
  }

  // Given no start timestamp and no end timestamp, the system maintenance alert should be open, as
  // it's enabled and has a message.
  return true;
}

export const hasActivatedCurrentLicenseOrLicenseRequest = ({
  subscriptionPlan,
  subscriptionLicense,
  licenseRequests,
}) => {
  const hasActivatedCurrentLicense = subscriptionPlan?.isCurrent
    && subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED;
  return hasActivatedCurrentLicense || licenseRequests.length > 0;
};

export const hasAssignedCodesOrCodeRequests = ({ couponCodesCount, couponCodeRequests }) => (
  couponCodesCount > 0 || couponCodeRequests.length > 0
);

export const hasAutoAppliedLearnerCreditPolicies = (redeemableLearnerCreditPolicies) => {
  const autoAppliedPolicyTypes = [
    POLICY_TYPES.PER_LEARNER_CREDIT,
    POLICY_TYPES.PER_ENROLLMENT_CREDIT,
  ];
  return redeemableLearnerCreditPolicies.redeemablePolicies.some(
    policy => autoAppliedPolicyTypes.includes(policy.policyType),
  );
};

export const hasAllocatedOrAcceptedAssignments = (redeemableLearnerCreditPolicies) => (
  redeemableLearnerCreditPolicies.learnerContentAssignments.hasAllocatedAssignments
  || redeemableLearnerCreditPolicies.learnerContentAssignments.hasAcceptedAssignments
);

/**
 * Determine whether learner has only content assignments available to them, based on the presence of:
 * - content assignments for display (allocated or canceled)
 * - no auto-applied budgets
 * - no current enterprise offers
 * - no active license or license requests
 * - no assigned codes or code requests
 *
 * @param {Object} params - The parameters object.
 * @param {Object} params.subscriptionPlan - The subscription plan of the learner.
 * @param {Object} params.subscriptionLicense - The subscription license of the learner.
 * @param {Array} params.licenseRequests - The license requests of the learner.
 * @param {number} params.couponCodesCount - The count of assigned coupon codes of the learner.
 * @param {Array} params.couponCodeRequests - The coupon code requests of the learner.
 * @param {Object} params.redeemableLearnerCreditPolicies - The redeemable learner credit policies.
 * @param {boolean} params.hasCurrentEnterpriseOffers - Whether the learner has current enterprise offers.
 * @returns {boolean} - Returns true if the learner has only content assignments available to them, false otherwise.
 */
export function determineLearnerHasContentAssignmentsOnly({
  subscriptionPlan,
  subscriptionLicense,
  licenseRequests,
  couponCodesCount,
  couponCodeRequests,
  redeemableLearnerCreditPolicies,
  hasCurrentEnterpriseOffers,
}) {
  const hasAssignments = hasAllocatedOrAcceptedAssignments(redeemableLearnerCreditPolicies);
  // If the enterprise learner does not have any applicable assignments, we can return early to avoid additional checks
  if (!hasAssignments) {
    return false;
  }

  // We check for any true values for the following cases. If any cases return true, this
  // indicates that the enterprise learner is not an assignment only learner. We default
  // return to true when no other subsidy or subsidy requests exist
  switch (true) {
    case hasCurrentEnterpriseOffers:
      return false;
    case hasActivatedCurrentLicenseOrLicenseRequest({ subscriptionPlan, subscriptionLicense, licenseRequests }):
      return false;
    case hasAutoAppliedLearnerCreditPolicies(redeemableLearnerCreditPolicies):
      return false;
    case hasAssignedCodesOrCodeRequests({ couponCodeRequests, couponCodesCount }):
      return false;
    default:
      // The default 'true' value indicates that the learner is an assignment only learner
      return true;
  }
}

/**
 * Helper function to determine which linked enterprise customer user record
 * should be used for display in the UI.
 * @param {*} param0
 * @returns
 */
export function determineEnterpriseCustomerUserForDisplay({
  activeEnterpriseCustomer,
  enterpriseSlug,
  foundEnterpriseCustomerUserForCurrentSlug,
  staffEnterpriseCustomer,
}) {
  const activeEnterpriseCustomerUser = {
    enterpriseCustomer: activeEnterpriseCustomer,
  };
  // No enterprise slug in the URL, so return the active enterprise customer user.
  if (!enterpriseSlug) {
    return activeEnterpriseCustomerUser;
  }

  // If the enterprise slug in the URL does not match the active enterprise
  // customer user's slug and there is a linked enterprise customer user for
  // the requested slug, return the linked enterprise customer user.
  if (enterpriseSlug !== activeEnterpriseCustomer?.slug && foundEnterpriseCustomerUserForCurrentSlug) {
    return {
      enterpriseCustomer: foundEnterpriseCustomerUserForCurrentSlug.enterpriseCustomer,
    };
  }

  if (staffEnterpriseCustomer) {
    return {
      enterpriseCustomer: staffEnterpriseCustomer,
    };
  }

  // Otherwise, return no enterprise customer metadata.
  return activeEnterpriseCustomerUser;
}

/**
 * Takes a flattened array of assignments and returns an object containing
 * lists of assignments for each assignment state.
 *
 * @param {Array} assignments - List of content assignments.
 * @returns {{
*  assignments: Array,
*  hasAssignments: Boolean,
*  allocatedAssignments: Array,
*  hasAllocatedAssignments: Boolean,
*  canceledAssignments: Array,
*  hasCanceledAssignments: Boolean,
*  acceptedAssignments: Array,
*  hasAcceptedAssignments: Boolean,
*  expiredAssignments: Array,
*  hasExpiredAssignments: Boolean,
*  erroredAssignments: Array,
*  hasErroredAssignments: Boolean,
*  reversedAssignments: Array,
*  hasReversedAssignments: Boolean,
*  assignmentsForDisplay: Array,
*  hasAssignmentsForDisplay: Boolean
* }}
*/
export function getAssignmentsByState(assignments = []) {
  const allocatedAssignments = [];
  const acceptedAssignments = [];
  const canceledAssignments = [];
  const expiredAssignments = [];
  const erroredAssignments = [];
  const reversedAssignments = [];
  const assignmentsForDisplay = [];

  assignments.forEach((assignment) => {
    switch (assignment.state) {
      case ASSIGNMENT_TYPES.ALLOCATED:
        allocatedAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.ACCEPTED:
        acceptedAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.CANCELED:
        canceledAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.EXPIRED:
        expiredAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.ERRORED:
        erroredAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.REVERSED:
        reversedAssignments.push(assignment);
        break;
      default:
        logError(`[getAssignmentsByState] Unsupported state ${assignment.state} for assignment ${assignment.uuid}`);
        break;
    }
  });

  const hasAssignments = assignments.length > 0;
  const hasAllocatedAssignments = allocatedAssignments.length > 0;
  const hasAcceptedAssignments = acceptedAssignments.length > 0;
  const hasCanceledAssignments = canceledAssignments.length > 0;
  const hasExpiredAssignments = expiredAssignments.length > 0;
  const hasErroredAssignments = erroredAssignments.length > 0;
  const hasReversedAssignments = reversedAssignments.length > 0;

  // Concatenate all assignments for display (includes allocated and canceled assignments)
  assignmentsForDisplay.push(...allocatedAssignments);
  assignmentsForDisplay.push(...canceledAssignments);
  assignmentsForDisplay.push(...expiredAssignments);
  const hasAssignmentsForDisplay = assignmentsForDisplay.length > 0;

  return {
    assignments,
    hasAssignments,
    allocatedAssignments,
    hasAllocatedAssignments,
    acceptedAssignments,
    hasAcceptedAssignments,
    canceledAssignments,
    hasCanceledAssignments,
    expiredAssignments,
    hasExpiredAssignments,
    erroredAssignments,
    hasErroredAssignments,
    reversedAssignments,
    hasReversedAssignments,
    assignmentsForDisplay,
    hasAssignmentsForDisplay,
  };
}

/**
 * Transform enterprise customer metadata for use by consuming UI components.
 * @param {Object} enterpriseCustomer
 * @returns
 */
export function transformEnterpriseCustomer(enterpriseCustomer) {
  // Otherwise, learner portal is enabled, so transform the enterprise customer data.
  const disableSearch = !!(
    !enterpriseCustomer.enableIntegratedCustomerLearnerPortalSearch
    && enterpriseCustomer.identityProvider
  );
  const showIntegrationWarning = !!(!disableSearch && enterpriseCustomer.activeIntegrations?.length > 0);
  const brandColors = getBrandColorsFromCSSVariables();
  const defaultPrimaryColor = brandColors.primary;
  const defaultSecondaryColor = brandColors.info100;
  const defaultTertiaryColor = brandColors.info500;
  const {
    primaryColor,
    secondaryColor,
    tertiaryColor,
  } = enterpriseCustomer.brandingConfiguration || {};

  return {
    ...enterpriseCustomer,
    brandingConfiguration: {
      ...enterpriseCustomer.brandingConfiguration,
      primaryColor: primaryColor || defaultPrimaryColor,
      secondaryColor: secondaryColor || defaultSecondaryColor,
      tertiaryColor: tertiaryColor || defaultTertiaryColor,
    },
    disableSearch,
    showIntegrationWarning,
  };
}

/**
 * Transforms the redeemable policies data by attaching the subsidy expiration date
 * to each assignment within the policies, if available.
 * @param {object[]} [policies] - Array of policy objects containing learner assignments.
 * @returns {object} - Returns modified policies data with subsidy expiration dates attached to assignments.
 */
export function transformRedeemablePoliciesData(policies = []) {
  return policies.map((policy) => {
    const assignmentsWithSubsidyExpiration = policy.learnerContentAssignments?.map(assignment => ({
      ...assignment,
      subsidyExpirationDate: policy.subsidyExpirationDate,
    }));
    return {
      ...policy,
      learnerContentAssignments: assignmentsWithSubsidyExpiration,
    };
  });
}

/**
 * Determines whether a course enrollment may be unenrolled based on its enrollment
 * status (e.g., in progress, completed) and enrollment completion.
 *
 * @param {Object} courseEnrollment Data for an enterprise course enrollment.
 * @returns True if the enrollment can be unenrolled. False if not.
 */
export const canUnenrollCourseEnrollment = (courseEnrollment) => {
  const unenrollableCourseRunTypes = new Set([
    COURSE_STATUSES.inProgress,
    COURSE_STATUSES.upcoming,
    COURSE_STATUSES.completed,
    COURSE_STATUSES.savedForLater,
  ]);
  return (
    unenrollableCourseRunTypes.has(courseEnrollment.courseRunStatus)
    && !courseEnrollment.certificateDownloadUrl
  );
};

/**
 * Transforms the raw course enrollment data from API into the expected
 * shape for consuming UI components/logic.
 *
 * @param {*} rawCourseEnrollment
 * @returns
 */
export const transformCourseEnrollment = (rawCourseEnrollment) => {
  const courseEnrollment = { ...rawCourseEnrollment };
  // Return the fields expected by the component(s)
  courseEnrollment.title = courseEnrollment.displayName;
  // The link to course here gives precedence to the resume course link, which is
  // present if the learner has made progress. If the learner has not made progress,
  // we should link to the main course run URL. Similarly, if the resume course link
  // is not set in the API response, we should fallback on the normal course link.
  courseEnrollment.linkToCourse = courseEnrollment.resumeCourseRunUrl || courseEnrollment.courseRunUrl;
  courseEnrollment.linkToCertificate = courseEnrollment.certificateDownloadUrl;
  courseEnrollment.hasEmailsEnabled = courseEnrollment.emailsEnabled;
  courseEnrollment.notifications = courseEnrollment.dueDates;
  courseEnrollment.canUnenroll = canUnenrollCourseEnrollment(courseEnrollment);

  // Delete renamed/unused fields
  delete courseEnrollment.displayName;
  delete courseEnrollment.courseRunUrl;
  delete courseEnrollment.certificateDownloadUrl;
  delete courseEnrollment.emailsEnabled;
  delete courseEnrollment.dueDates;

  return courseEnrollment;
};

/**
 * Groups course enrollments by their status.
 * @param {*} courseEnrollments
 * @returns
 */
export const groupCourseEnrollmentsByStatus = (courseEnrollments) => {
  const courseEnrollmentsByStatus = Object.keys(COURSE_STATUSES).reduce((acc, status) => {
    // Skip assigned and requested course enrollment statuses; this function is intended to only
    // group by realized enrollment statuses, not requested/assigned statuses.
    if (![COURSE_STATUSES.assigned, COURSE_STATUSES.requested].includes(status)) {
      acc[status] = courseEnrollments ? courseEnrollments.filter(
        courseEnrollment => courseEnrollment.courseRunStatus === COURSE_STATUSES[status],
      ) : [];
    }
    return acc;
  }, {});
  return courseEnrollmentsByStatus;
};

/**
 * Transforms a subsidy request into the shape expected by CourseCard component(s).
 * @param {{subsidyRequest: Object, slug: string}} args the subsidy request and slug to use for course link
 *
 * @returns {Object} { courseRunId, title, courseRunStatus, linkToCourse, created }
 */
export const transformSubsidyRequest = ({
  subsidyRequest,
  slug,
}) => ({
  courseRunId: subsidyRequest.courseId,
  title: subsidyRequest.courseTitle,
  orgName: subsidyRequest.coursePartners?.map(partner => partner.name).join(', '),
  courseRunStatus: COURSE_STATUSES.requested,
  linkToCourse: `${slug}/course/${subsidyRequest.courseId}`,
  created: subsidyRequest.created,
  notifications: [], // required prop by CourseSection
});

export const determineAssignmentState = ({ state }) => ({
  isAcceptedAssignment: state === ASSIGNMENT_TYPES.ACCEPTED,
  isAllocatedAssignment: state === ASSIGNMENT_TYPES.ALLOCATED,
  isCanceledAssignment: state === ASSIGNMENT_TYPES.CANCELED,
  isExpiredAssignment: state === ASSIGNMENT_TYPES.EXPIRED,
  isErroredAssignment: state === ASSIGNMENT_TYPES.ERRORED,
  isExpiringAssignment: state === ASSIGNMENT_TYPES.EXPIRING,
});

export const transformLearnerContentAssignment = (learnerContentAssignment, enterpriseSlug) => {
  const {
    contentKey,
    parentContentKey,
    isAssignedCourseRun,
    state,
    earliestPossibleExpiration,
  } = learnerContentAssignment;
  const {
    isExpiredAssignment,
    isCanceledAssignment,
  } = determineAssignmentState({ state });
  const { date: assignmentEnrollByDeadline } = earliestPossibleExpiration;

  // This logic is intended to remain backwards
  // compatible with assignments for top-level courses
  let courseKey = contentKey;
  let courseRunId = courseKey;
  if (isAssignedCourseRun) {
    courseKey = parentContentKey;
    courseRunId = contentKey;
  }
  return {
    linkToCourse: `/${enterpriseSlug}/course/${courseKey}`,
    courseRunId,
    isAssignedCourseRun,
    title: learnerContentAssignment.contentTitle,
    isRevoked: false,
    notifications: [],
    courseRunStatus: COURSE_STATUSES.assigned,
    endDate: learnerContentAssignment.contentMetadata?.endDate,
    startDate: learnerContentAssignment.contentMetadata?.startDate,
    mode: learnerContentAssignment.contentMetadata?.courseType,
    orgName: learnerContentAssignment.contentMetadata?.partners[0]?.name,
    enrollBy: assignmentEnrollByDeadline,
    isCanceledAssignment,
    isExpiredAssignment,
    isExpiringAssignment: isTodayWithinDateThreshold({
      date: assignmentEnrollByDeadline,
      days: ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS,
    }),
    assignmentConfiguration: learnerContentAssignment.assignmentConfiguration,
    uuid: learnerContentAssignment.uuid,
    learnerAcknowledged: learnerContentAssignment.learnerAcknowledged,
  };
};

export const transformLearnerCreditRequest = (learnerCreditRequest, enterpriseSlug) => {
  if (!learnerCreditRequest) {
    return null;
  }

  const {
    uuid,
    courseTitle,
    courseId,
    coursePartners,
    startDate,
    assignment,
  } = learnerCreditRequest;

  const orgName = coursePartners?.[0]?.name || null;
  const state = learnerCreditRequest.state === 'requested' ? 'lc_requested' : learnerCreditRequest.state;

  return {
    uuid,
    title: courseTitle,
    courseRunId: courseId,
    linkToCourse: `/${enterpriseSlug}/course/${courseId}`,
    orgName,
    courseRunStatus: state,
    startDate: startDate || null,
    isLearnerCreditRequest: true,
    associatedAssignment: assignment,
  };
};

/**
 * Transforms a learner assignment into a shape consistent with course
 * enrollments, including additional fields specific to learner content
 * assignments (e.g., isCanceledAssignment, isExpiredAssignment,
 * assignmentConfiguration). Used for the display of CourseCard component(s)
 * while acknowledging canceled/expired assignments via the
 * `useAcknowledgeContentAssignments` hook.
 *
 * @param {Array} assignments - Array of assignments to be transformed.
 * @param {String} enterpriseSlug - Slug of the enterprise.
 * @returns {Array} - Returns the transformed array of assignments.
 */
export const getTransformedAllocatedAssignments = (assignments, enterpriseSlug) => {
  const updatedAssignments = assignments.map(
    (assignment) => transformLearnerContentAssignment(assignment, enterpriseSlug),
  );
  return updatedAssignments;
};

/**
 * Retrieves the error stack for display.
 * @param {Error | unknown} [error]
 */
export function retrieveErrorMessageForDisplay(error) {
  if (!error) {
    return null;
  }
  let errorMessage = error.message;
  if (error.customAttributes) {
    errorMessage += `\nCustom attributes: ${error.customAttributes.httpErrorResponseData}`;
  }
  return errorMessage;
}

/**
 * Retrieves the error stack for display.
 * @param {Error | unknown} [error]
 */
export function retrieveErrorStackForDisplay(error) {
  if (!error) {
    return null;
  }
  return error.stack;
}

/**
 * Retrieves the number of buffer days allowed for late enrollments, if any policy
 * has late redemption enabled.
 * @param {Array} redeemablePolicies List of redeemable policies.
 * @returns {number|undefined} - Returns the number of late redemption buffer days
 *  if any policy has late redemption enabled.
 */
export function getLateEnrollmentBufferDays(redeemablePolicies) {
  if (!redeemablePolicies) {
    return undefined;
  }
  const anyPolicyHasLateRedemptionEnabled = redeemablePolicies.some((policy) => (
    // is_late_redemption_allowed=True on the serialized policy represents the fact that late
    // redemption has been temporarily enabled by an operator for the policy. It will toggle
    // itself back to False after a finite period of time.
    policy.isLateRedemptionAllowed
  ));
  return anyPolicyHasLateRedemptionEnabled ? LATE_ENROLLMENTS_BUFFER_DAYS : undefined;
}

// See https://2u-internal.atlassian.net/wiki/spaces/WS/pages/8749811/Enroll+button+and+Course+Run+Selector+Logic
// for more detailed documentation on course run selection and the enroll button.
export function getActiveCourseRun(course) {
  return course.courseRuns.find(courseRun => courseRun.uuid === course.advertisedCourseRunUuid);
}

export function isArchived(courseRun) {
  if (courseRun.availability) {
    return courseRun.availability === COURSE_AVAILABILITY_MAP.ARCHIVED;
  }
  return false;
}

/**
 * These are the standard rules used for determining whether a run is "available":
 * - isMarketable or isMarketableExternal: The run is marketable for enterprise use cases.
 * - !isArchived: The run is not archived.
 * - isEnrollable: The run is enrollable, meaning the enrollment window is open.
 */
export const standardAvailableCourseRunsFilter = (courseRun, courseRunKey) => {
  const isStandardAvailable = (
    (courseRun.isMarketable || courseRun.isMarketableExternal)
    && !isArchived(courseRun)
    && courseRun.isEnrollable
  );

  if (courseRunKey) {
    // If a courseRunKey is provided, we also check that the courseRun matches its key.
    return courseRun.key === courseRunKey && isStandardAvailable;
  }

  return isStandardAvailable;
};

/**
 * Returns list of available runs that are marketable, enrollable, and not archived.
 *
 * This function is used by logic that determines which runs should be visible on the course about page.
 *
 * @param {object} course - The course containing runs which will be a superset of the returned runs.
 * @param {number} lateEnrollmentBufferDays - number of days to buffer the enrollment end date, or undefined.
 * @returns List of course runs.
 */
export function getAvailableCourseRuns({
  course,
  lateEnrollmentBufferDays,
  courseRunKey,
}) {
  if (!course?.courseRuns) {
    return [];
  }

  // These are more relaxed availability rules when late enrollment is applicable. We still never show archived courses,
  // but the rules around the following fields are relaxed:
  //
  // * courseRun.isEnrollable: This field represents the enrollment window actually stored in the database. However,
  //   during late enrollment we expand the end date of the enrollment window by lateEnrollmentBufferDays.
  // * courseRun.isMarketable: This field is True when the run is published, has seats, and has a marketing URL. Since
  //   late enrollment potentially means enrolling into an unpublished run, we must ignore the run state.
  const lateEnrollmentAvailableCourseRunsFilter = (courseRun) => {
    if (
      isArchived(courseRun)
      // The next two checks are in lieu of isMarketable which is otherwise overly sensitive to courserun state.
      || !courseRun.seats?.length
      || !courseRun.marketingUrl
    ) {
      return false;
    }
    // Finally, check against an expanded enrollment window.
    const today = dayjs();
    if (!courseRun.enrollmentEnd || (courseRun.enrollmentStart && today.isBefore(dayjs(courseRun.enrollmentStart)))) {
      // In cases where we don't expect the buffer to change behavior, fallback to the backend-provided value.
      return standardAvailableCourseRunsFilter(courseRun, courseRunKey);
    }
    const bufferedEnrollDeadline = dayjs(courseRun.enrollmentEnd).add(lateEnrollmentBufferDays, 'day');
    return today.isBefore(bufferedEnrollDeadline);
  };

  return course.courseRuns.filter(
    isDefinedAndNotNull(lateEnrollmentBufferDays)
      ? lateEnrollmentAvailableCourseRunsFilter
      : (courseRun) => standardAvailableCourseRunsFilter(courseRun, courseRunKey),
  );
}

export function getCatalogsForSubsidyRequests({
  browseAndRequestConfiguration,
  customerAgreement,
  couponsOverview,
}) {
  const catalogs = [];
  if (!browseAndRequestConfiguration?.subsidyRequestsEnabled) {
    return catalogs;
  }
  if (browseAndRequestConfiguration.subsidyType === SUBSIDY_TYPE.LICENSE && customerAgreement) {
    // availableSubscriptionCatalogs only contains the unique catalogs
    // across all subscription plans for an enterprise customer
    const catalogsFromSubscriptions = customerAgreement.availableSubscriptionCatalogs;
    catalogs.push(...catalogsFromSubscriptions);
  }
  if (browseAndRequestConfiguration.subsidyType === SUBSIDY_TYPE.COUPON) {
    const catalogsFromCoupons = couponsOverview
      .filter(coupon => !!coupon.available)
      .map(coupon => coupon.enterpriseCatalogUuid);
    // catalogs from coupons may be duplicative, so pushing a Set of catalogs is necessary here
    catalogs.push(...new Set(catalogsFromCoupons));
  }
  return catalogs;
}

export function getSearchCatalogs({
  redeemablePolicies,
  subscriptionLicense,
  couponCodeAssignments,
  currentEnterpriseOffers,
  catalogsForSubsidyRequests,
}) {
  // Track catalog uuids to include in search with a Set to avoid duplicates.
  const catalogUUIDs = new Set();

  // Scope to catalogs from redeemable subsidy access policies, coupons,
  // enterprise offers, or subscription plan associated with learner's license.
  redeemablePolicies.forEach((policy) => catalogUUIDs.add(policy.catalogUuid));

  if (subscriptionLicense?.subscriptionPlan.isCurrent && subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) {
    catalogUUIDs.add(subscriptionLicense.subscriptionPlan.enterpriseCatalogUuid);
  }
  if (features.ENROLL_WITH_CODES) {
    const availableCouponCodes = couponCodeAssignments.filter(couponCode => couponCode.available);
    availableCouponCodes.forEach((couponCode) => catalogUUIDs.add(couponCode.catalog));
  }

  if (features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS) {
    currentEnterpriseOffers.forEach((offer) => catalogUUIDs.add(offer.enterpriseCatalogUuid));
  }

  // Scope to catalogs associated with assignable subsidies if browse and request is turned on
  catalogsForSubsidyRequests.forEach((catalog) => catalogUUIDs.add(catalog));

  // Convert Set back to array
  return Array.from(catalogUUIDs);
}

const getBestCourseMode = (courseModes) => {
  const {
    VERIFIED,
    PROFESSIONAL,
    NO_ID_PROFESSIONAL,
    AUDIT,
    HONOR,
    PAID_EXECUTIVE_EDUCATION,
  } = COURSE_MODES_MAP;

  // Returns the 'highest' course mode available.
  // Modes are ranked ['verified', 'professional', 'no-id-professional', 'audit', 'honor', 'paid-executive-education']
  const courseModesByRank = [VERIFIED, PROFESSIONAL, NO_ID_PROFESSIONAL, PAID_EXECUTIVE_EDUCATION, AUDIT, HONOR];
  const bestCourseMode = courseModesByRank.find((courseMode) => courseModes.includes(courseMode));
  return bestCourseMode || null;
};

/**
 * Returns the first seat found from the preferred course mode.
 */
export function findHighestLevelSkuByEntityModeType(seatsOrEntitlements, getModeType) {
  const courseModes = seatsOrEntitlements.map(getModeType);
  const courseMode = getBestCourseMode(courseModes);
  if (courseMode) {
    return seatsOrEntitlements.find(entity => getModeType(entity) === courseMode)?.sku;
  }
  return null;
}

/**
 * Returns the first entitlement found from the preferred course mode
 */
export function findHighestLevelEntitlementSku(entitlements) {
  if (!entitlements || entitlements.length <= 0) {
    return null;
  }
  return findHighestLevelSkuByEntityModeType(entitlements, entitlement => entitlement.mode);
}

/**
 * Transforms a learner's group membership into a shape that will be used for the
 * display of NewGroupAssignmentAlert when they are added to a new group.
 *
 * @param {Array} groupMemberships - Array of groupMemberships to be transformed.
 * @param {String} groupUuid - UUID of the group.
 * @returns {Array} Returns the transformed array of group memberships.
 */
export function transformGroupMembership(groupMemberships, groupUuid) {
  return groupMemberships.map(groupMembership => ({
    ...groupMembership,
    groupUuid,
  }));
}

/**
 * check if an object is empty
 * @param {Object} obj
 * @returns {boolean}
 */
export function isObjEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * returns expired and unexpired policies
 * @param policies
 * @returns {{expiredPolicies: *[], unexpiredPolicies: *[]}}
 */
export const filterPoliciesByExpirationAndActive = (policies) => {
  const expiredPolicies = [];
  const unexpiredPolicies = [];
  policies.forEach((policy) => {
    const expiryDate = dayjs(policy.subsidyExpirationDate);
    if (expiryDate.isAfter(dayjs()) && policy.active) {
      unexpiredPolicies.push(policy);
    } else {
      expiredPolicies.push(policy);
    }
  });
  return {
    expiredPolicies,
    unexpiredPolicies,
  };
};

/**
 * Returns a formatted object based on the subsidy or subsides passed
 *
 * Prioritization for enrollment is as follows:
 *  - Subscriptions
 *  - Coupons
 *  - Learner Credit
 *  - Offers
 *
 *
 * @param applicableSubscriptionLicense
 * @param applicableCouponCode
 * @param applicableEnterpriseOffer
 * @param applicableSubsidyAccessPolicy
 */
export const getSubsidyToApplyForCourse = ({
  applicableSubscriptionLicense = undefined,
  applicableCouponCode = undefined,
  applicableEnterpriseOffer = undefined,
  applicableSubsidyAccessPolicy = undefined,
}) => {
  if (applicableSubscriptionLicense) {
    return {
      subsidyType: LICENSE_SUBSIDY_TYPE,
      discountType: 'percentage',
      discountValue: 100,
      startDate: applicableSubscriptionLicense.subscriptionPlan.startDate,
      expirationDate: applicableSubscriptionLicense.subscriptionPlan.expirationDate,
      status: applicableSubscriptionLicense.status,
      subsidyId: applicableSubscriptionLicense.uuid,
    };
  }

  if (applicableCouponCode) {
    return {
      discountType: applicableCouponCode.usageType,
      discountValue: applicableCouponCode.benefitValue,
      startDate: applicableCouponCode.couponStartDate,
      endDate: applicableCouponCode.couponEndDate,
      code: applicableCouponCode.code,
      subsidyType: COUPON_CODE_SUBSIDY_TYPE,
    };
  }

  if (
    applicableSubsidyAccessPolicy?.isPolicyRedemptionEnabled
    && applicableSubsidyAccessPolicy.redeemableSubsidyAccessPolicy
  ) {
    const { redeemableSubsidyAccessPolicy, availableCourseRuns } = applicableSubsidyAccessPolicy;
    return {
      discountType: 'percentage',
      discountValue: 100,
      subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
      policyType: redeemableSubsidyAccessPolicy.policyType,
      perLearnerEnrollmentLimit: redeemableSubsidyAccessPolicy.perLearnerEnrollmentLimit,
      perLearnerSpendLimit: redeemableSubsidyAccessPolicy.perLearnerSpendLimit,
      policyRedemptionUrl: redeemableSubsidyAccessPolicy.policyRedemptionUrl,
      availableCourseRuns,
    };
  }

  if (applicableEnterpriseOffer) {
    return {
      discountType: applicableEnterpriseOffer.usageType.toLowerCase(),
      discountValue: applicableEnterpriseOffer.discountValue,
      startDate: applicableEnterpriseOffer.startDatetime,
      endDate: applicableEnterpriseOffer.endDatetime,
      offerType: applicableEnterpriseOffer.offerType,
      subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
      maxUserDiscount: applicableEnterpriseOffer.maxUserDiscount,
      maxUserApplications: applicableEnterpriseOffer.maxUserApplications,
      remainingBalance: applicableEnterpriseOffer.remainingBalance,
      remainingBalanceForUser: applicableEnterpriseOffer.remainingBalanceForUser,
      remainingApplications: applicableEnterpriseOffer.remainingApplications,
      remainingApplicationsForUser: applicableEnterpriseOffer.remainingApplicationsForUser,
      isCurrent: applicableEnterpriseOffer.isCurrent,
    };
  }

  return undefined;
};

/**
 * Determines whether the course enrollment can be upgraded to verified enrollment.
 *
 * @param {Object} enrollment Metadata about a course enrollment, containing the course mode and enrollment deadline.
 * @returns {boolean} Whether the course enrollment can be upgraded to verified enrollment.
 */
export function isEnrollmentUpgradeable(enrollment) {
  // Determine whether the course enrollment can be upgraded to verified enrollment, based
  // on the course mode and enrollment deadline (if any).
  const isEnrollByLapsed = enrollment.enrollBy ? dayjs().isAfter(dayjs(enrollment.enrollBy)) : false;
  const canUpgradeToVerifiedEnrollment = enrollment.mode === COURSE_MODES_MAP.AUDIT && !isEnrollByLapsed;
  return canUpgradeToVerifiedEnrollment;
}

/**
 * Determines if allocatedAssignments are courseRun based
 *
 * @param redeemableLearnerCreditPolicies
 * @param courseKey
 * @returns {
 *   {
 *     hasAssignedCourseRuns: boolean,
 *    allocatedCourseRunAssignmentKeys: *,
 *    allocatedCourseRunAssignments: *,
 *    hasMultipleAssignedCourseRuns: boolean
 *   } |
 *   {
 *    hasAssignedCourseRuns: boolean,
 *    allocatedCourseRunAssignmentKeys: *[],
 *    allocatedCourseRunAssignments: *[],
 *    hasMultipleAssignedCourseRuns: boolean
 *   }
 * }
 */
export function determineAllocatedAssignmentsForCourse({
  redeemableLearnerCreditPolicies,
  courseKey,
}) {
  const { learnerContentAssignments } = redeemableLearnerCreditPolicies;
  // note: checking the non-happy path first, with early return so happy path code isn't nested in conditional.
  if (!learnerContentAssignments.hasAllocatedAssignments) {
    return {
      isCourseAssigned: false,
      allocatedAssignmentsForCourse: [],
      allocatedCourseRunAssignmentKeys: [],
      allocatedCourseRunAssignments: [],
      hasAssignedCourseRuns: false,
      hasMultipleAssignedCourseRuns: false,
    };
  }

  const allocatedAssignmentsForCourse = [];
  const allocatedCourseRunAssignments = [];

  learnerContentAssignments.allocatedAssignments.forEach((assignment) => {
    const isCourseRunAssignment = assignment.isAssignedCourseRun && assignment.parentContentKey === courseKey;
    const isCourseAssignment = !assignment.isAssignedCourseRun && assignment.contentKey === courseKey;
    if (isCourseRunAssignment || isCourseAssignment) {
      allocatedAssignmentsForCourse.push(assignment);
    }
    if (isCourseRunAssignment) {
      allocatedCourseRunAssignments.push(assignment);
    }
  });

  const isCourseAssigned = allocatedAssignmentsForCourse.length > 0;
  const allocatedCourseRunAssignmentKeys = allocatedCourseRunAssignments.map(assignment => assignment.contentKey);
  const hasAssignedCourseRuns = allocatedCourseRunAssignmentKeys.length > 0;
  const hasMultipleAssignedCourseRuns = allocatedCourseRunAssignmentKeys.length > 1;

  return {
    isCourseAssigned,
    allocatedAssignmentsForCourse,
    allocatedCourseRunAssignmentKeys,
    allocatedCourseRunAssignments,
    hasAssignedCourseRuns,
    hasMultipleAssignedCourseRuns,
  };
}

/**
 * Transform course metadata to display available runs with multiple allocated course runs
 *
 * @param hasMultipleAssignedCourseRuns
 * @param courseMetadata
 * @param allocatedCourseRunAssignmentKeys
 * @returns {
 * * |
 *  (* &
 *    {
 *      courseRuns: *,
 *      availableCourseRuns: *,
 *      courseRunKeys: *
 *    }
 *  )
 * }
 */
export function transformCourseMetadataByAllocatedCourseRunAssignments({
  courseMetadata,
  allocatedCourseRunAssignmentKeys,
}) {
  if (allocatedCourseRunAssignmentKeys.length > 0) {
    const filterForCourseRunKeys = (courseRun) => allocatedCourseRunAssignmentKeys.includes(courseRun.key);
    return {
      ...courseMetadata,
      courseRuns: courseMetadata.courseRuns.filter(filterForCourseRunKeys),
      availableCourseRuns: courseMetadata.availableCourseRuns?.filter(filterForCourseRunKeys),
      courseRunKeys: courseMetadata.courseRunKeys?.filter(filterForCourseRunKeys),
    };
  }

  return courseMetadata;
}

/**
 * Adds a subscription license to the subscription licenses grouped by status.
 * @param {Object} args
 * @param {Object} args.subscriptionLicensesByStatus - The subscription licenses grouped by status.
 * @param {Object} args.subscriptionLicense - The subscription license to add to the subscription licenses by status.
 * @returns {Object} - Returns the updated subscription licenses grouped by status.
 */
export function addLicenseToSubscriptionLicensesByStatus({ subscriptionLicensesByStatus, subscriptionLicense }) {
  const licenseStatus = subscriptionLicense.status;
  const updatedLicensesByStatus = { ...subscriptionLicensesByStatus };
  if (!updatedLicensesByStatus[licenseStatus]) {
    updatedLicensesByStatus[licenseStatus] = [];
  }
  updatedLicensesByStatus[licenseStatus].push(subscriptionLicense);
  return updatedLicensesByStatus;
}

/**
 * Extracts the course run key from the search parameters of a URL.
 * @param {Object} searchParams - The URLSearchParams object containing the search parameters.
 * @returns {string|undefined} - Returns the course run key if present, or null if not.
 */
export function extractCourseRunKeyFromSearchParams(searchParams) {
  // `requestUrl.searchParams` uses `URLSearchParams`, which decodes `+` as a space, so we
  // need to replace it with `+` again to be a valid course run key.
  const courseRunKey = searchParams.get('course_run_key')?.replaceAll(' ', '+');
  return courseRunKey;
}

/**
 * Returns the course runs available for redemption based on the course and learner credit policies.
 */
export function getCourseRunsForRedemption({
  course,
  lateEnrollmentBufferDays,
  courseRunKey,
  redeemableLearnerCreditPolicies,
  hasSubsidyPrioritizedOverLearnerCredit,
}) {
  const availableCourseRuns = getAvailableCourseRuns({
    course,
    lateEnrollmentBufferDays,
    courseRunKey,
  });
  const availableCourseRunKeys = availableCourseRuns.map((courseRun) => courseRun.key);
  const defaultReturnValue = {
    courseRuns: availableCourseRuns,
    courseRunKeys: availableCourseRunKeys,
  };
  if (hasSubsidyPrioritizedOverLearnerCredit) {
    // If subsidies are prioritized over learner credit, return all available course runs.
    // For example, subscriptions take precedence over learner credit.
    return defaultReturnValue;
  }
  const {
    allocatedCourseRunAssignmentKeys,
  } = determineAllocatedAssignmentsForCourse({
    courseKey: course.key,
    redeemableLearnerCreditPolicies,
  });
  if (allocatedCourseRunAssignmentKeys.length > 0) {
    // Filter available course run keys to only those that have an associated allocated assignment.
    return {
      courseRuns: availableCourseRuns.filter((courseRun) => (
        allocatedCourseRunAssignmentKeys.includes(courseRun.key)
      )),
      courseRunKeys: availableCourseRunKeys.filter((key) => (
        allocatedCourseRunAssignmentKeys.includes(key)
      )),
    };
  }
  return defaultReturnValue;
}

/**
 * Finds a coupon code that is applicable to the course based on the catalog list.
 * @param couponCodes
 * @param catalogList
 * @returns {*}
 */
export function findCouponCodeForCourse(couponCodes, catalogList = []) {
  return couponCodes.find((couponCode) => catalogList?.includes(couponCode.catalog) && hasValidStartExpirationDates({
    startDate: couponCode.couponStartDate,
    endDate: couponCode.couponEndDate,
  }));
}

export function determineSubscriptionLicenseApplicable(subscriptionLicense, catalogsWithCourse) {
  return (
    subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED
    && subscriptionLicense?.subscriptionPlan.isCurrent
    && catalogsWithCourse.includes(subscriptionLicense?.subscriptionPlan.enterpriseCatalogUuid)
  );
}

/**
 * Returns the price of the course.
 * @param {Object} courseMetadata
 * @returns {number}
 */
export function getCoursePrice(courseMetadata) {
  if (!courseMetadata) {
    return null;
  }

  // 1. Check for current course run with fixed price USD
  const courseRuns = courseMetadata.courseRuns || [];
  const currentCourseRun = courseRuns.find(
    (run) => run.availability === 'Current',
  );

  if (
    currentCourseRun
    && (currentCourseRun.fixedPriceUsd
      || currentCourseRun.firstEnrollablePaidSeatPrice)
  ) {
    const priceInUSD = parseFloat(
      currentCourseRun.fixedPriceUsd
      || currentCourseRun.firstEnrollablePaidSeatPrice,
    );
    return Math.round(priceInUSD * 100);
  }

  // 2. Check for exec ed 2U course entitlements
  const entitlements = courseMetadata.entitlements || [];
  for (const entitlement of entitlements) {
    if (entitlement.price && entitlement.mode === 'paid-executive-education') {
      return Math.round(parseFloat(entitlement.price) * 100);
    }
  }
  // 3. Check for first entitlement price
  if (entitlements?.length) {
    return Math.round(parseFloat(entitlements[0].price) * 100);
  }
  // 4. Return default normalized price in cents
  return 0;
}

export const SUPPORTED_LANGUAGES = ['en', 'es'];

/**
 * Get the current locale, falling back to English if unsupported
 * @returns {string} A supported language code ('en' or 'es')
 */
export const getSupportedLocale = () => {
  const currentLocale = getLocale();
  const baseLocale = currentLocale.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.includes(baseLocale) ? baseLocale : 'en';
};
