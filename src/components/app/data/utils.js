import dayjs from 'dayjs';
import { logError, logInfo } from '@edx/frontend-platform/logging';

import { ASSIGNMENT_TYPES, POLICY_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { getBrandColorsFromCSSVariables, isDefinedAndNotNull, isTodayWithinDateThreshold } from '../../../utils/common';
import { COURSE_STATUSES, SUBSIDY_TYPE } from '../../../constants';
import { LATE_ENROLLMENTS_BUFFER_DAYS } from '../../../config/constants';
import {
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

  // Given no start timestamp, the system maintenance alert should be open, as
  // it's enabled and has a message.
  if (!startTimestamp) {
    return true;
  }

  // Otherwise, check whether today's date is after the defined start date.
  return dayjs().isAfter(dayjs(startTimestamp));
}

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
  const hasActiveLicense = !!(subscriptionPlan?.isActive && subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED);
  const hasActiveLicenseOrLicenseRequest = hasActiveLicense || licenseRequests.length > 0;

  const hasAssignedCodesOrCodeRequests = couponCodesCount > 0 || couponCodeRequests.length > 0;
  const autoAppliedPolicyTypes = [
    POLICY_TYPES.PER_LEARNER_CREDIT,
    POLICY_TYPES.PER_ENROLLMENT_CREDIT,
  ];
  const hasAutoAppliedLearnerCreditPolicies = !!redeemableLearnerCreditPolicies.redeemablePolicies.filter(
    policy => autoAppliedPolicyTypes.includes(policy.policyType),
  ).length > 0;
  const hasAllocatedOrAcceptedAssignments = !!(
    redeemableLearnerCreditPolicies.learnerContentAssignments.hasAllocatedAssignments
    || redeemableLearnerCreditPolicies.learnerContentAssignments.hasAcceptedAssignments
  );

  return (
    hasAllocatedOrAcceptedAssignments
    && !hasCurrentEnterpriseOffers
    && !hasActiveLicenseOrLicenseRequest
    && !hasAssignedCodesOrCodeRequests
    && !hasAutoAppliedLearnerCreditPolicies
  );
}

/**
 * Helper function to determine which linked enterprise customer user record
 * should be used for display in the UI.
 * @param {*} param0
 * @returns
 */
export function determineEnterpriseCustomerUserForDisplay({
  activeEnterpriseCustomer,
  activeEnterpriseCustomerUserRoleAssignments,
  enterpriseSlug,
  foundEnterpriseCustomerUserForCurrentSlug,
  staffEnterpriseCustomer,
}) {
  const activeEnterpriseCustomerUser = {
    enterpriseCustomer: activeEnterpriseCustomer,
    roleAssignments: activeEnterpriseCustomerUserRoleAssignments,
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
      roleAssignments: foundEnterpriseCustomerUserForCurrentSlug.roleAssignments,
    };
  }

  if (staffEnterpriseCustomer) {
    return {
      enterpriseCustomer: staffEnterpriseCustomer,
      roleAssignments: [],
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
* }}
*/
export function getAssignmentsByState(assignments = []) {
  const allocatedAssignments = [];
  const acceptedAssignments = [];
  const canceledAssignments = [];
  const expiredAssignments = [];
  const erroredAssignments = [];
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
  // If the learner portal is not enabled for the displayed enterprise customer, return null. This
  // results in the enterprise learner portal not being accessible for the user, showing a 404 page.
  if (!enterpriseCustomer?.enableLearnerPortal) {
    return undefined;
  }

  // Otherwise, learner portal is enabled, so transform the enterprise customer data.
  const disableSearch = !!(
    !enterpriseCustomer.enableIntegratedCustomerLearnerPortalSearch
    && enterpriseCustomer.identityProvider
  );
  const showIntegrationWarning = !!(!disableSearch && enterpriseCustomer.identityProvider);
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
 * TODO
 * @param {*} rawCourseEnrollment
 * @returns
 */
export const transformCourseEnrollment = (rawCourseEnrollment) => {
  const courseEnrollment = { ...rawCourseEnrollment };

  // Return the fields expected by the component(s)
  courseEnrollment.title = courseEnrollment.displayName;
  courseEnrollment.microMastersTitle = courseEnrollment.micromastersTitle;
  // The link to course here gives precedence to the resume course link, which is
  // present if the learner has made progress. If the learner has not made progress,
  // we should link to the main course run URL. Similarly, if the resume course link
  // is not set in the API response, we should fallback on the normal course link.
  courseEnrollment.linkToCourse = courseEnrollment.resumeCourseRunUrl || courseEnrollment.courseRunUrl;
  courseEnrollment.linkToCertificate = courseEnrollment.certificateDownloadUrl;
  courseEnrollment.hasEmailsEnabled = courseEnrollment.emailsEnabled;
  courseEnrollment.notifications = courseEnrollment.dueDates;
  courseEnrollment.canUnenroll = canUnenrollCourseEnrollment(courseEnrollment);
  courseEnrollment.isCourseAssigned = false;

  // Delete renamed/unused fields
  delete courseEnrollment.displayName;
  delete courseEnrollment.micromastersTitle;
  delete courseEnrollment.courseRunUrl;
  delete courseEnrollment.certificateDownloadUrl;
  delete courseEnrollment.emailsEnabled;
  delete courseEnrollment.dueDates;

  return courseEnrollment;
};

/**
 * TODO
 * @param {*} courseEnrollments
 * @returns
 */
export const groupCourseEnrollmentsByStatus = (courseEnrollments) => {
  const courseEnrollmentsByStatus = Object.keys(COURSE_STATUSES).reduce((acc, status) => {
    acc[status] = courseEnrollments ? courseEnrollments.filter(
      courseEnrollment => courseEnrollment.courseRunStatus === COURSE_STATUSES[status],
    ) : [];
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

export const transformLearnerContentAssignment = (learnerContentAssignment, enterpriseSlug) => {
  const isCanceledAssignment = learnerContentAssignment.state === ASSIGNMENT_TYPES.CANCELED;
  const isExpiredAssignment = learnerContentAssignment.state === ASSIGNMENT_TYPES.EXPIRED;
  const { date: assignmentEnrollByDeadline } = learnerContentAssignment.earliestPossibleExpiration;
  return {
    linkToCourse: `/${enterpriseSlug}/course/${learnerContentAssignment.contentKey}`,
    // Note: we are using `courseRunId` instead of `contentKey` or `courseKey` because the `CourseSection`
    // and `BaseCourseCard` components expect `courseRunId` to be used as the content identifier. Consider
    // refactoring to rename `courseRunId` to `contentKey` in the future given learner content assignments
    // are for top-level courses, not course runs.
    courseRunId: learnerContentAssignment.contentKey,
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

export function retrieveErrorMessage(error) {
  if (!error) {
    return null;
  }
  if (error.customAttributes) {
    return error.customAttributes.httpErrorResponseData;
  }
  return error.message;
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
 * Returns list of available runs that are marketable, enrollable, and not archived.
 *
 * This function is used by logic that determines which runs should be visible on the course about page.
 *
 * @param {object} course - The course containing runs which will be a superset of the returned runs.
 * @param {number} lateEnrollmentBufferDays - number of days to buffer the enrollment end date, or undefined.
 * @returns List of course runs.
 */
export function getAvailableCourseRuns({ course, lateEnrollmentBufferDays }) {
  if (!course?.courseRuns) {
    return [];
  }

  // These are the standard rules used for determining whether a run is "available".
  const standardAvailableCourseRunsFilter = (courseRun) => (
    courseRun.isMarketable && !isArchived(courseRun) && courseRun.isEnrollable
  );

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
      return standardAvailableCourseRunsFilter(courseRun);
    }
    const bufferedEnrollDeadline = dayjs(courseRun.enrollmentEnd).add(lateEnrollmentBufferDays, 'day');
    return today.isBefore(bufferedEnrollDeadline);
  };

  // lateEnrollmentBufferDays being set is used as a heuristic to determine if the late enrollment feature is enabled.
  return course.courseRuns.filter(
    isDefinedAndNotNull(lateEnrollmentBufferDays)
      ? lateEnrollmentAvailableCourseRunsFilter
      : standardAvailableCourseRunsFilter,
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

/* eslint-disable max-len */
/**
 * Returns a formatted object based on the subsidy or subsides passed
 *
 * Prioritization for enrollment is as follows:
 *  - Subscriptions
 *  - Coupons
 *  - Learner Credit
 *  - Offers
 *
 * @param applicableSubscriptionLicense
 * @param applicableCouponCode
 * @param applicableEnterpriseOffer
 * @param applicableSubsidyAccessPolicy
 * @returns {{perLearnerSpendLimit: (number|null|Number|*), policyRedemptionUrl: (string|string|*), discountType: string, discountValue: number, subsidyType: string, perLearnerEnrollmentLimit: (null|*)}|{subsidyId, discountType: string, discountValue: number, startDate, subsidyType: string, expirationDate, status}|undefined|{maxUserApplications: (null|*), endDate: (string|*), subsidyType: string, offerType: *, isCurrent, remainingApplications: (number|null|*), remainingApplicationsForUser: (number|null|*), discountType: string, remainingBalance, remainingBalanceForUser, discountValue, startDate: (string|*), maxUserDiscount}|{code, endDate: (string|*), discountType: (string|*), discountValue: (number|*), startDate: (string|*), subsidyType: string}}
 */
/* eslint-enable max-len */
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

  if (applicableSubsidyAccessPolicy?.isPolicyRedemptionEnabled) {
    const { redeemableSubsidyAccessPolicy } = applicableSubsidyAccessPolicy;
    return {
      discountType: 'percentage',
      discountValue: 100,
      subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
      perLearnerEnrollmentLimit: redeemableSubsidyAccessPolicy?.perLearnerEnrollmentLimit,
      perLearnerSpendLimit: redeemableSubsidyAccessPolicy?.perLearnerSpendLimit,
      policyRedemptionUrl: redeemableSubsidyAccessPolicy?.policyRedemptionUrl,
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
const test = {
  uuid: 'df4f42e2-ed44-47bb-a73f-607f926c69af',
  assignmentConfiguration: 'c40950ce-15d6-46d9-bf1f-62a0988239db',
  learnerEmail: 'hullah@2u.com',
  lmsUserId: 5266560,
  contentKey: 'course-v1:edx+H200+2025',
  contentTitle: 'Intermediate Happiness',
  contentQuantity: -100,
  state: 'allocated',
  transactionUuid: null,
  actions: [
    {
      created: '2024-08-06T12:11:55.618790Z',
      modified: '2024-08-06T12:11:55.618821Z',
      uuid: 'cdd6eb1e-6834-4199-be3d-2ff41e43f9e7',
      actionType: 'learner_linked',
      completedAt: '2024-08-06T12:11:55.618262Z',
      errorReason: null,
      learnerAcknowledged: null,
    },
    {
      created: '2024-08-06T12:11:55.798956Z',
      modified: '2024-08-06T12:11:55.798993Z',
      uuid: '5d5b2650-693d-4eed-a79e-c8805108cbf9',
      actionType: 'notified',
      completedAt: '2024-08-06T12:11:55.798321Z',
      errorReason: null,
      learnerAcknowledged: null,
    },
  ],
  earliestPossibleExpiration: {
    date: '2024-11-04T12:11:55.366834Z',
    reason: 'NINETY_DAYS_PASSED',
  },
  contentMetadata: {
    startDate: '2020-10-01T16:00:00Z',
    endDate: '2112-10-21T16:00:00Z',
    enrollByDate: '2112-10-11T23:59:59Z',
    contentPrice: 1,
    courseType: 'verified-audit',
    partners: [
      {
        name: 'edX',
        logoImageUrl: 'https://stage-discovery.edx-cdn.org/organization/logos/4f8cb2c9-589b-4d1e-88c1-b01a02db3a9c-086cef28bdf5.png',
      },
    ],
  },
  learnerAcknowledged: null,
  subsidyExpirationDate: '2025-07-17T00:00:00Z',
};

const test2 = {
  uuid: 'df4f42e2-ed44-47bb-a73f-607f926c69af',
  assignmentConfiguration: 'c40950ce-15d6-46d9-bf1f-62a0988239db',
  learnerEmail: 'hullah@2u.com',
  lmsUserId: 5266560,
  contentKey: 'course-v1:edx+H200+2018',
  contentTitle: 'Intermediate Happiness',
  contentQuantity: -100,
  state: 'allocated',
  transactionUuid: null,
  actions: [
    {
      created: '2024-08-06T12:11:55.618790Z',
      modified: '2024-08-06T12:11:55.618821Z',
      uuid: 'cdd6eb1e-6834-4199-be3d-2ff41e43f9e7',
      actionType: 'learner_linked',
      completedAt: '2024-08-06T12:11:55.618262Z',
      errorReason: null,
      learnerAcknowledged: null,
    },
    {
      created: '2024-08-06T12:11:55.798956Z',
      modified: '2024-08-06T12:11:55.798993Z',
      uuid: '5d5b2650-693d-4eed-a79e-c8805108cbf9',
      actionType: 'notified',
      completedAt: '2024-08-06T12:11:55.798321Z',
      errorReason: null,
      learnerAcknowledged: null,
    },
  ],
  earliestPossibleExpiration: {
    date: '2023-12-03T12:11:55.366834Z',
    reason: 'NINETY_DAYS_PASSED',
  },
  contentMetadata: {
    startDate: '2020-10-01T16:00:00Z',
    endDate: '2112-10-21T16:00:00Z',
    enrollByDate: '2112-10-11T23:59:59Z',
    contentPrice: 1,
    courseType: 'verified-audit',
    partners: [
      {
        name: 'edX',
        logoImageUrl: 'https://stage-discovery.edx-cdn.org/organization/logos/4f8cb2c9-589b-4d1e-88c1-b01a02db3a9c-086cef28bdf5.png',
      },
    ],
  },
  learnerAcknowledged: null,
  subsidyExpirationDate: '2025-07-17T00:00:00Z',
};

const test3 = {
  uuid: 'df4f42e2-ed44-47bb-a73f-607f926c69af',
  assignmentConfiguration: 'c40950ce-15d6-46d9-bf1f-62a0988239db',
  learnerEmail: 'hullah@2u.com',
  lmsUserId: 5266560,
  contentKey: 'course-v1:edx+H200+2T2020',
  contentTitle: 'Intermediate Happiness',
  contentQuantity: -100,
  state: 'allocated',
  transactionUuid: null,
  actions: [
    {
      created: '2024-08-06T12:11:55.618790Z',
      modified: '2024-08-06T12:11:55.618821Z',
      uuid: 'cdd6eb1e-6834-4199-be3d-2ff41e43f9e7',
      actionType: 'learner_linked',
      completedAt: '2024-08-06T12:11:55.618262Z',
      errorReason: null,
      learnerAcknowledged: null,
    },
    {
      created: '2024-08-06T12:11:55.798956Z',
      modified: '2024-08-06T12:11:55.798993Z',
      uuid: '5d5b2650-693d-4eed-a79e-c8805108cbf9',
      actionType: 'notified',
      completedAt: '2024-08-06T12:11:55.798321Z',
      errorReason: null,
      learnerAcknowledged: null,
    },
  ],
  earliestPossibleExpiration: {
    date: '2025-01-05T12:11:55.366834Z',
    reason: 'NINETY_DAYS_PASSED',
  },
  contentMetadata: {
    startDate: '2020-10-01T16:00:00Z',
    endDate: '2112-10-21T16:00:00Z',
    enrollByDate: '2112-10-11T23:59:59Z',
    contentPrice: 1,
    courseType: 'verified-audit',
    partners: [
      {
        name: 'edX',
        logoImageUrl: 'https://stage-discovery.edx-cdn.org/organization/logos/4f8cb2c9-589b-4d1e-88c1-b01a02db3a9c-086cef28bdf5.png',
      },
    ],
  },
  learnerAcknowledged: null,
  subsidyExpirationDate: '2025-07-17T00:00:00Z',
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

export function determineAllocatedCourseRuns({
  redeemableLearnerCreditPolicies,
  courseKey,
}) {
  const { learnerContentAssignments } = redeemableLearnerCreditPolicies;
  if (learnerContentAssignments.hasAllocatedAssignments) {
    let allocatedCourseRunAssignments = learnerContentAssignments.allocatedAssignments.filter(
      (assignment) => assignment?.isAssignedCourseRun,
    );
    if (courseKey) {
      allocatedCourseRunAssignments = allocatedCourseRunAssignments.filter(
        (assignment) => assignment?.parentContentKey === courseKey,
      );
    }
    const allocatedCourseRunAssignmentKeys = allocatedCourseRunAssignments.map(assignment => assignment.contentKey);
    const hasAssignedCourseRuns = allocatedCourseRunAssignmentKeys.length > 0;
    const hasMultipleAssignedCourseRuns = allocatedCourseRunAssignmentKeys.length > 1;
    return {
      allocatedCourseRunAssignmentKeys: ['course-v1:edx+H200+2018', 'course-v1:edx+H200+2T2020'],
      allocatedCourseRunAssignments: [test2, test3],
      hasAssignedCourseRuns: true,
      hasMultipleAssignedCourseRuns: true,
    };
  }
  return {
    allocatedCourseRunAssignmentKeys: [],
    allocatedCourseRunAssignments: [],
    hasAssignedCourseRuns: false,
    hasMultipleAssignedCourseRuns: false,
  };
}

export function transformCourseMetadataByAllocationCourseRun({
  hasMultipleAssignedCourseRuns,
  courseMetadata,
  allocatedCourseRunAssignmentKeys,
}) {
  if (true || hasMultipleAssignedCourseRuns && allocatedCourseRunAssignmentKeys.length > 1) {
    return {
      ...courseMetadata,
      courseRuns: courseMetadata.courseRuns.filter(
        courseRun => allocatedCourseRunAssignmentKeys.includes(courseRun.key),
      ),
      availableCourseRuns: courseMetadata.courseRuns.filter(
        courseRun => allocatedCourseRunAssignmentKeys.includes(courseRun.key),
      ),
    };
  }
  return courseMetadata;
}

export function getSoonestEarliestPossibleExpirationData({
  assignmentObjectArray,
  dateFormat = null,
}) {
  if (!Array.isArray(assignmentObjectArray) || !assignmentObjectArray?.length) {
    logInfo(`[sortedByExpirationDate] ${assignmentObjectArray} is not an array, or an empty array`);
    return {
      date: null,
      reason: null,
      sortedByExpirationDate: null,
    };
  }
  const assignmentsWithExpiration = assignmentObjectArray.filter(
    assignment => !!assignment?.earliestPossibleExpiration,
  );
  if (!assignmentsWithExpiration?.length) {
    logInfo(`[sortedByExpirationDate] ${assignmentsWithExpiration} does not contain earliestPossibleExpiration field`);
    return {
      date: null,
      reason: null,
      sortedExpirationDateData: null,
    };
  }

  const sortedByExpirationDate = assignmentsWithExpiration.sort(
    (a, b) => new Date(a.earliestPossibleExpiration.date) - new Date(b.earliestPossibleExpiration.date),
  );
  let { date } = sortedByExpirationDate[0].earliestPossibleExpiration;
  if (dateFormat) {
    date = dayjs(date).format(dateFormat);
  }

  return {
    date,
    reason: sortedByExpirationDate[0].earliestPossibleExpiration?.reason,
    soonestExpirationDateData: sortedByExpirationDate[0],
    sortedExpirationDateData: sortedByExpirationDate,
  };
}
