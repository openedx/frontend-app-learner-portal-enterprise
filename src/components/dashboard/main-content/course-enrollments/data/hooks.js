import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import {
  sendEnterpriseTrackEvent,
  sendEnterpriseTrackEventWithDelay,
} from '@edx/frontend-enterprise-utils';

import { useLocation } from 'react-router-dom';
import * as service from './service';
import { HAS_USER_DISMISSED_NEW_GROUP_ALERT } from './constants';
import {
  createEnrollWithCouponCodeUrl,
  createEnrollWithLicenseUrl,
  findHighestLevelSeatSku,
} from '../../../../course/data/utils';
import { getExpiringAssignmentsAcknowledgementState, getHasUnacknowledgedAssignments } from '../../../data/utils';
import {
  ASSIGNMENT_TYPES,
  COUPON_CODE_SUBSIDY_TYPE,
  findCouponCodeForCourse,
  getSubsidyToApplyForCourse,
  isEnrollmentUpgradeable,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
  queryEnterpriseCourseEnrollments,
  queryEnterpriseLearnerDashboardBFF,
  queryRedeemablePolicies,
  useCanUpgradeWithLearnerCredit,
  useCouponCodes,
  useCourseRunMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContent,
  useIsBFFEnabled,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../../../app/data';
import { sortAssignmentsByAssignmentStatus, sortedEnrollmentsByEnrollmentDate } from './utils';
import { ASSIGNMENTS_EXPIRING_WARNING_LOCALSTORAGE_KEY } from '../../../data/constants';
import { LICENSE_STATUS } from '../../../../enterprise-user-subsidy/data/constants';
import { useStatefulEnroll } from '../../../../stateful-enroll/data';
import { COURSE_STATUSES } from '../../../../../constants';
import { findCourseStatusKey } from '../../../../../utils/common';

/**
 * Return data for upgrading a course using the user's subsidies
 * Based on the applicable subsidy, the upgrade URL, applicable subsidy metadata and toggled loading state
 * will return in the following prioritization order:
 *  - Subscriptions
 *  - Coupon codes
 *  - Learner Credit Subsidy
 *
 * @param {object} args Arguments.
 * @param {String} args.courseRunKey id of the course run
 * @param {String} args.mode The mode of the course. Used as a gating mechanism for upgrade eligibility.
 * @param {Function} args.onRedemptionSuccess Callback function to execute on successful redemption.
 * @param {Function} args.onRedemptionError Callback function to execute on redemption error.
 * @returns {Object} {
 *     subsidyForCourse: undefined,
 *     courseRunPrice: undefined,
 *     hasUpgradeAndConfirm: false,
 *     isPending: false,
 * }
 */
export const useCourseUpgradeData = ({
  courseRunKey,
  mode,
  enrollBy,
  onRedeem,
  onRedeemSuccess,
  onRedeemError,
}) => {
  const location = useLocation();
  const canUpgradeToVerifiedEnrollment = isEnrollmentUpgradeable({ mode, enrollBy });
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  // Metadata required to determine if the course run is contained in the customer's content catalog(s)
  const {
    data: customerContainsContent,
    isPending: isCustomerContainsContentPending,
  } = useEnterpriseCustomerContainsContent([courseRunKey]);

  // Metadata required to allow upgrade via applicable learner credit subsidy
  const {
    data: learnerCreditMetadata,
    isPending: isLearnerCreditMetadataPending,
  } = useCanUpgradeWithLearnerCredit(courseRunKey);

  // Metadata required to allow upgrade via applicable subscription license
  const { data: subscriptionLicense } = useSubscriptions({
    select: (data) => {
      let license;
      if (data?.transformed) {
        // If the data has been transformed, use the transformed data.
        license = data.transformed.subscriptionLicense;
      } else {
        license = data?.subscriptionLicense;
      }
      const isLicenseActivated = !!(license?.status === LICENSE_STATUS.ACTIVATED);
      const isSubscriptionPlanCurrent = !!license?.subscriptionPlan.isCurrent;
      if (!isLicenseActivated || !isSubscriptionPlanCurrent) {
        return null;
      }
      return license;
    },
  });

  // Metadata required to allow upgrade via applicable coupon code
  const { data: applicableCouponCode } = useCouponCodes({
    select: (data) => findCouponCodeForCourse(data.couponCodeAssignments, customerContainsContent?.catalogList),
  });

  // If coupon codes are eligible, retrieve the course run's product SKU metadata from API
  const {
    data: courseRunDetails,
    isPending: isCourseRunDetailsPending,
  } = useCourseRunMetadata(courseRunKey, {
    select: (data) => ({
      ...data,
      sku: findHighestLevelSeatSku(data.seats),
    }),
  });

  const { data: enterpriseCourseEnrollmentsMetadata } = useEnterpriseCourseEnrollments();

  const redeemLearnerCredit = useStatefulEnroll({
    contentKey: courseRunKey,
    subsidyAccessPolicy: learnerCreditMetadata?.applicableSubsidyAccessPolicy?.redeemableSubsidyAccessPolicy,
    onBeginRedeem: onRedeem,
    onSuccess: onRedeemSuccess,
    onError: onRedeemError,
    userEnrollments: enterpriseCourseEnrollmentsMetadata.enterpriseCourseEnrollments,
  });

  const hasPendingQueries = (
    isCustomerContainsContentPending || isLearnerCreditMetadataPending || isCourseRunDetailsPending
  );

  return useMemo(() => {
    const defaultReturn = {
      subsidyForCourse: null,
      courseRunPrice: null,
      hasUpgradeAndConfirm: false,
      redeem: null,
      isPending: hasPendingQueries,
    };

    // Return early if the user is unable to upgrade to their course mode OR the content
    // to upgrade is not contained in the customer's content catalog(s).
    if (!canUpgradeToVerifiedEnrollment || !customerContainsContent?.containsContentItems) {
      return defaultReturn;
    }

    // Determine applicable subsidy, if any, based on priority order of subsidy types.
    const applicableSubsidy = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: subscriptionLicense,
      applicableCouponCode,
      applicableSubsidyAccessPolicy: learnerCreditMetadata?.applicableSubsidyAccessPolicy,
    });

    // No applicable subsidy found, return early.
    if (!applicableSubsidy) {
      return defaultReturn;
    }

    // Construct and return subscription based upgrade url
    if (applicableSubsidy.subsidyType === LICENSE_SUBSIDY_TYPE) {
      applicableSubsidy.redemptionUrl = createEnrollWithLicenseUrl({
        courseRunKey,
        enterpriseId: enterpriseCustomer.uuid,
        licenseUUID: subscriptionLicense.uuid,
        location,
      });
      return {
        ...defaultReturn,
        subsidyForCourse: applicableSubsidy,
        redeem: async (e) => {
          e?.preventDefault();
          await sendEnterpriseTrackEventWithDelay(
            enterpriseCustomer.uuid,
            'edx.ui.enterprise.learner_portal.course.upgrade_button.subscription_license.clicked',
          );
          global.location.assign(applicableSubsidy.redemptionUrl);
        },
      };
    }

    // Construct and return coupon code based upgrade url
    if (applicableSubsidy.subsidyType === COUPON_CODE_SUBSIDY_TYPE) {
      applicableSubsidy.redemptionUrl = createEnrollWithCouponCodeUrl({
        courseRunKey,
        sku: courseRunDetails?.sku,
        code: applicableSubsidy.code,
        location,
      });
      return {
        ...defaultReturn,
        subsidyForCourse: applicableSubsidy,
        courseRunPrice: courseRunDetails?.firstEnrollablePaidSeatPrice,
        hasUpgradeAndConfirm: true,
        redeem: async (e) => {
          e?.preventDefault();
          await sendEnterpriseTrackEventWithDelay(
            enterpriseCustomer.uuid,
            'edx.ui.enterprise.learner_portal.course.upgrade_button.coupon_code.clicked',
          );
          global.location.assign(applicableSubsidy.redemptionUrl);
        },
      };
    }

    // Construct and return learner credit based upgrade url
    if (applicableSubsidy.subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE) {
      const { policyRedemptionUrl } = learnerCreditMetadata.applicableSubsidyAccessPolicy.redeemableSubsidyAccessPolicy;
      applicableSubsidy.redemptionUrl = policyRedemptionUrl;
      return {
        ...defaultReturn,
        subsidyForCourse: applicableSubsidy,
        courseRunPrice: learnerCreditMetadata.listPrice,
        hasUpgradeAndConfirm: true,
        redeem: async () => {
          await redeemLearnerCredit();
        },
      };
    }

    // If no subsidy type is applicable, return with default values
    return defaultReturn;
  }, [
    subscriptionLicense,
    canUpgradeToVerifiedEnrollment,
    applicableCouponCode,
    courseRunDetails?.firstEnrollablePaidSeatPrice,
    courseRunDetails?.sku,
    courseRunKey,
    customerContainsContent?.containsContentItems,
    enterpriseCustomer.uuid,
    learnerCreditMetadata,
    location,
    redeemLearnerCredit,
    hasPendingQueries,
  ]);
};

/**
 * Custom hook for handling the upgrade course button logic.
 */
export function useUpgradeCourseButton() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const [confirmationButtonState, setConfirmationButtonState] = useState('default');

  const handleRedeem = () => {
    setConfirmationButtonState('pending');
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.upgrade_button.confirmed',
    );
  };

  const handleRedemptionSuccess = async (transaction) => {
    if (transaction?.state !== 'committed') {
      return;
    }
    setConfirmationButtonState('complete');
    const { coursewareUrl } = transaction;
    global.location.assign(coursewareUrl);
  };

  const handleRedemptionError = () => {
    setConfirmationButtonState('error');
  };

  return {
    confirmationButtonState,
    setConfirmationButtonState,
    handleRedeem,
    handleRedemptionSuccess,
    handleRedemptionError,
  };
}

export function useAcknowledgeContentAssignments({
  enterpriseId,
  userId,
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentsByAssignmentConfiguration,
    }) => {
      const promisesToAcknowledge = [];
      Object.entries(assignmentsByAssignmentConfiguration).forEach(
        ([assignmentConfiguration, assignmentsForConfiguration]) => {
          const assignmentIds = assignmentsForConfiguration.map(assignment => assignment.uuid);
          promisesToAcknowledge.push(
            service.acknowledgeContentAssignments({
              assignmentConfigurationId: assignmentConfiguration,
              assignmentIds,
            }),
          );
        },
      );
      const responses = await Promise.all(promisesToAcknowledge);
      return responses.map(response => camelCaseObject(response.data));
    },
    onSuccess: async () => {
      // Invalidate the query for the redeemable policies in order to trigger refetch of `credits_available` API,
      // returning the updated assignments list per policy, excluding now-acknowledged assignments.
      await queryClient.invalidateQueries(
        queryRedeemablePolicies({
          enterpriseUuid: enterpriseId,
          lmsUserId: userId,
        }).queryKey,
      );
    },
  });
}

/**
 * - Parses list of redeemable learner credit policies to extract a list of learner content
 * assignments across all policies.
 * - Filters the assignments to only include those that are allocated, canceled, or expired,
 * and have not yet been acknowledged (dismissed).
 * - Sorts the list of assignments for display by status (allocated, canceled, expired).
 * - Provides helper functions to handle dismissal of the canceled/expired assignments alerts.
 *
 * @param {Object} redeemableLearnerCreditPolicies - Object containing list of redeemable learner credit policies.
 * @returns {Object} - Returns an object with the following properties:
 * - assignments: Array of transformed assignments for display.
 * - showCanceledAssignmentsAlert: Boolean indicating whether to display the canceled assignments alert.
 * - showExpiredAssignmentsAlert: Boolean indicating whether to display the expired assignments alert.
 * - handleAcknowledgeAssignments: Function to handle dismissal of canceled/expired assignments from the dashboard.
 */
export function useContentAssignments() {
  const { authenticatedUser: { userId } } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: { allEnrollmentsByStatus } } = useEnterpriseCourseEnrollments();
  const [assignments, setAssignments] = useState([]);
  const [showExpiringAssignmentsAlert, setShowExpiringAssignmentsAlert] = useState(false);
  const [showCanceledAssignmentsAlert, setShowCanceledAssignmentsAlert] = useState(false);
  const [showExpiredAssignmentsAlert, setShowExpiredAssignmentsAlert] = useState(false);
  const [isAcknowledgingAssignments, setIsAcknowledgingAssignments] = useState(false);

  const handleAcknowledgeExpiringAssignments = useCallback(() => {
    const { expiringAssignments } = getExpiringAssignmentsAcknowledgementState(assignments);
    global.localStorage.setItem(
      ASSIGNMENTS_EXPIRING_WARNING_LOCALSTORAGE_KEY,
      JSON.stringify(expiringAssignments.map(assignment => assignment.uuid)),
    );
    setShowExpiringAssignmentsAlert(false);
  }, [assignments]);

  const {
    mutateAsync,
    isLoading: isPendingMutation,
  } = useAcknowledgeContentAssignments({ enterpriseId: enterpriseCustomer.uuid, userId });

  const handleAcknowledgeAssignments = useCallback(async ({ assignmentState }) => {
    const assignmentStateMap = {
      [ASSIGNMENT_TYPES.CANCELED]: 'isCanceledAssignment',
      [ASSIGNMENT_TYPES.EXPIRED]: 'isExpiredAssignment',
    };

    // Fail early if mutation is already in progress.
    if (isPendingMutation) {
      logError('Attempted to acknowledge assignments while mutation is already in progress.');
      return;
    }

    // Invalid assignment state passed to function.
    const assignmentStateProperty = assignmentStateMap[assignmentState];
    if (!assignmentStateProperty) {
      logError(`Invalid assignment state (${assignmentState}) passed to handleAcknowledgeAssignments.`);
      return;
    }
    // Otherwise, perform the mutation to acknowledge assignments.
    const assignmentsByAssignmentConfiguration = {};
    assignments.forEach((assignment) => {
      const { assignmentConfiguration } = assignment;
      // Check whether assignment is in requested state. If not, skip.
      const isRequestedStateActive = !!assignment[assignmentStateProperty];
      if (!isRequestedStateActive) {
        return;
      }
      // Initialize assignment list for AssignmentConfiguration, if necessary.
      if (!assignmentsByAssignmentConfiguration[assignmentConfiguration]) {
        assignmentsByAssignmentConfiguration[assignmentConfiguration] = [];
      }
      // Append the assignment to the AssignmentConfiguration.
      assignmentsByAssignmentConfiguration[assignmentConfiguration].push(assignment);
    });

    // POST to `acknowledge-assignments` API for each AssignmentConfiguration.
    setIsAcknowledgingAssignments(true);
    await mutateAsync({ assignmentsByAssignmentConfiguration });
    setIsAcknowledgingAssignments(false);
  }, [mutateAsync, assignments, isPendingMutation]);

  /**
   * Parses the learner content assignments from the redeemableLearnerCreditPolicies
   * response and filters out any canceled/expired assignments that have already been
   * acknowledged (dismissed) by the learner.
   */
  useEffect(() => {
    const {
      assignmentsForDisplay,
      canceledAssignments,
      expiredAssignments,
    } = allEnrollmentsByStatus.assigned;

    const potentiallyUpgradeableAuditEnrollmentCourses = [...allEnrollmentsByStatus.inProgress]
      .filter(enrollment => isEnrollmentUpgradeable(enrollment))
      .map((enrollment) => ({
        courseKey: enrollment.courseKey,
        courseRunId: enrollment.courseRunId,
      }));

    // Filter out any assignments that have a corresponding potentially upgradeable
    // audit enrollment. Note: all enrollment cards currently assume content key is
    // a course run id despite the current assignment's content key referring to a
    // top-level course key or a specific course run identifier as assignment.courseRunId.
    const filteredAssignmentsForDisplay = assignmentsForDisplay.filter((assignment) => (
      !potentiallyUpgradeableAuditEnrollmentCourses.some(({ courseKey, courseRunId }) => (
        [courseKey, courseRunId].includes(assignment.courseRunId)
      ))
    ));

    // Sort and transform the list of assignments for display.
    const sortedAssignmentsForDisplay = sortAssignmentsByAssignmentStatus(filteredAssignmentsForDisplay);
    setAssignments(sortedAssignmentsForDisplay);

    // Determine whether there are expiring assignments. If so, display alert.
    const { hasUnacknowledgedExpiringAssignments } = getExpiringAssignmentsAcknowledgementState(assignmentsForDisplay);
    setShowExpiringAssignmentsAlert(hasUnacknowledgedExpiringAssignments);

    // Determine whether there are unacknowledged canceled assignments. If so, display alert.
    const filteredCanceledAssignments = canceledAssignments.filter((assignment) => (
      !potentiallyUpgradeableAuditEnrollmentCourses.includes(assignment.courseRunId)
    ));
    const hasUnacknowledgedCanceledAssignments = getHasUnacknowledgedAssignments(filteredCanceledAssignments);
    setShowCanceledAssignmentsAlert(hasUnacknowledgedCanceledAssignments);

    // Determine whether there are unacknowledged expired assignments. If so, display alert.
    const filteredExpiredAssignments = expiredAssignments.filter((assignment) => (
      !potentiallyUpgradeableAuditEnrollmentCourses.includes(assignment.courseRunId)
    ));
    const hasUnacknowledgedExpiredAssignments = getHasUnacknowledgedAssignments(filteredExpiredAssignments);
    setShowExpiredAssignmentsAlert(hasUnacknowledgedExpiredAssignments);
  }, [allEnrollmentsByStatus.assigned, allEnrollmentsByStatus.inProgress, enterpriseCustomer.slug]);

  return {
    assignments,
    showCanceledAssignmentsAlert,
    showExpiredAssignmentsAlert,
    showExpiringAssignmentsAlert,
    handleAcknowledgeExpiringAssignments,
    handleAcknowledgeAssignments,
    isAcknowledgingAssignments,
  };
}

/**
 * Transforms list of course enrollments into sections for display in the dashboard (e.g., current,
 * completed, saved for later). Accounts for any accepted assignments.
 *
 * @param {Object} args
 * @param {Array} args.assignments - Array of assignments for learner/enterprise.
 * @param {Object} args.courseEnrollmentsByStatus - Object containing course enrollments grouped by status.
 * @returns {Object} - Returns an object with the following properties:
 * - hasCourseEnrollments: Boolean indicating whether there are any course enrollments.
 * - currentCourseEnrollments: Array of current course enrollments.
 * - completedCourseEnrollments: Array of completed course enrollments.
 * - savedForLaterCourseEnrollments: Array of saved for later course enrollments.
 */
export function useCourseEnrollmentsBySection(courseEnrollmentsByStatus) {
  const currentCourseEnrollments = useMemo(
    () => sortedEnrollmentsByEnrollmentDate([
      ...courseEnrollmentsByStatus.inProgress,
      ...courseEnrollmentsByStatus.upcoming,
      ...courseEnrollmentsByStatus.requested,
    ]),
    [courseEnrollmentsByStatus],
  );
  const completedCourseEnrollments = useMemo(
    () => sortedEnrollmentsByEnrollmentDate(courseEnrollmentsByStatus.completed),
    [courseEnrollmentsByStatus.completed],
  );

  const savedForLaterCourseEnrollments = useMemo(
    () => sortedEnrollmentsByEnrollmentDate(courseEnrollmentsByStatus.savedForLater),
    [courseEnrollmentsByStatus.savedForLater],
  );

  const hasCourseEnrollments = Object.entries(courseEnrollmentsByStatus)
    .map(([enrollmentStatus, enrollmentsForStatus]) => {
      if (enrollmentStatus === COURSE_STATUSES.assigned) {
        return enrollmentsForStatus.assignmentsForDisplay;
      }
      return enrollmentsForStatus;
    })
    .flat().length > 0;

  return {
    hasCourseEnrollments,
    currentCourseEnrollments,
    completedCourseEnrollments,
    savedForLaterCourseEnrollments,
  };
}

/**
 * - Provides a helper function to update the course enrollment status in the query cache.
 * @param {Object} args
 * @param {Object} args.enterpriseCustomer - Object containing enterprise customer data.
 * @returns {Function} - Returns a function to update a course enrollment status in the query cache. The
 *  function accepts a courseRunId and newStatus (i.e., the new status for which to update the enrollment).
 */
export function useUpdateCourseEnrollmentStatus() {
  const queryClient = useQueryClient();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const isBFFEnabled = useIsBFFEnabled();

  return useCallback(({ courseRunId, newStatus }) => {
    // Transformation to update the course enrollment status.
    const transformUpdatedEnrollment = (enrollment) => {
      if (enrollment.courseRunId !== courseRunId) {
        return enrollment;
      }
      return {
        ...enrollment,
        courseRunStatus: newStatus,
      };
    };

    if (isBFFEnabled) {
      // Determine which BFF queries need to be updated after updating enrollment status.
      const dashboardBFFQueryKey = queryEnterpriseLearnerDashboardBFF({
        enterpriseSlug: enterpriseCustomer.slug,
      }).queryKey;
      const bffQueryKeysToUpdate = [dashboardBFFQueryKey];
      // Update the enterpriseCourseEnrollments data in the cache for each BFF query.
      bffQueryKeysToUpdate.forEach((queryKey) => {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) {
            return oldData;
          }
          const updatedEnrollments = oldData.enterpriseCourseEnrollments.map(transformUpdatedEnrollment);
          const updatedAllEnrollmentsByStatus = Object.keys(oldData.allEnrollmentsByStatus).reduce((acc, status) => {
            acc[status] = oldData.allEnrollmentsByStatus[status]
              .filter((enrollment) => enrollment.courseRunId !== courseRunId)
              .map(transformUpdatedEnrollment);
            return acc;
          }, {});

          // Find the updated enrollment.
          const updatedEnrollment = updatedEnrollments.find(enrollment => enrollment.courseRunId === courseRunId);
          if (updatedEnrollment) {
            const newCourseStatusKey = findCourseStatusKey(updatedEnrollment.courseRunStatus);
            // Add the enrollment to the new status group.
            if (!updatedAllEnrollmentsByStatus[newCourseStatusKey]) {
              updatedAllEnrollmentsByStatus[newCourseStatusKey] = [];
            }
            updatedAllEnrollmentsByStatus[newCourseStatusKey].push(updatedEnrollment);
          }

          return {
            ...oldData,
            enterpriseCourseEnrollments: updatedEnrollments,
            allEnrollmentsByStatus: updatedAllEnrollmentsByStatus,
          };
        });
      });
    }

    // Update the legacy queryEnterpriseCourseEnrollments cache as well.
    const enterpriseCourseEnrollmentsQueryKey = queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid).queryKey;
    queryClient.setQueryData(enterpriseCourseEnrollmentsQueryKey, (oldData) => {
      const updatedData = oldData?.map(transformUpdatedEnrollment);
      return updatedData;
    });
  }, [queryClient, enterpriseCustomer, isBFFEnabled]);
}

/**
 * - Parses a list of redeemable policies and checks if learner has acknowledged the new group.
 * - Provides a helper function to handle adding the group uuid to local storage
 * when user dismisses the alert.
 *
 * @returns {Object} - Returns an object with the following properties:
 * - showNewGroupAlert: Boolean indicating whether to display the new group alert.
 * - handleAcknowledgeGroup: Function to handle dismissal of new group assignment
 * from the dashboard and adds group uuid to local storage.
 * - enterpriseCustomer: Object with customer name to display in alert.
 */
export function useGroupAssociationsAlert() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: { redeemablePolicies } } = useRedeemablePolicies();
  const [showNewGroupAssociationAlert, setShowNewGroupAssociationAlert] = useState(false);
  const [groupAssociationUUIDs, setGroupAssociationUUIDs] = useState([]);

  const dismissGroupAssociationAlert = () => {
    groupAssociationUUIDs.forEach(groupAssociationUUID => {
      global.localStorage.setItem(`${HAS_USER_DISMISSED_NEW_GROUP_ALERT}-${groupAssociationUUID}`, true);
    });
    setGroupAssociationUUIDs([]);
    setShowNewGroupAssociationAlert(false);
  };

  useEffect(() => {
    const newGroupAssociationUUIDs = [];
    redeemablePolicies.forEach(policy => {
      // Getting the first index because each policy only has 1 group association
      const groupAssociationUUID = policy.groupAssociations[0];
      const isGroupDismissed = global.localStorage.getItem(`${HAS_USER_DISMISSED_NEW_GROUP_ALERT}-${groupAssociationUUID}`);
      if (groupAssociationUUID && !isGroupDismissed) {
        setShowNewGroupAssociationAlert(true);
        newGroupAssociationUUIDs.push(groupAssociationUUID);
      }
    });
    setGroupAssociationUUIDs(prevUUIDs => [...prevUUIDs, ...newGroupAssociationUUIDs]);
  }, [redeemablePolicies]);

  return {
    showNewGroupAssociationAlert,
    dismissGroupAssociationAlert,
    enterpriseCustomer,
  };
}
