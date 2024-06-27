import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import _camelCase from 'lodash.camelcase';
import _cloneDeep from 'lodash.clonedeep';

import { useLocation } from 'react-router-dom';
import * as service from './service';
import { COURSE_STATUSES, HAS_USER_DISMISSED_NEW_GROUP_ALERT } from './constants';
import {
  createEnrollWithCouponCodeUrl,
  createEnrollWithLicenseUrl,
  findCouponCodeForCourse,
  findHighestLevelSeatSku,
} from '../../../../course/data/utils';
import { getExpiringAssignmentsAcknowledgementState, getHasUnacknowledgedAssignments } from '../../../data/utils';
import { ASSIGNMENT_TYPES } from '../../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import {
  COURSE_MODES_MAP,
  getSubsidyToApplyForCourse,
  groupCourseEnrollmentsByStatus,
  queryEnterpriseCourseEnrollments,
  queryRedeemablePolicies,
  transformCourseEnrollment,
  useCanUpgradeWithLearnerCredit,
  useCouponCodes,
  useCourseRunMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContent,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../../../app/data';
import { sortAssignmentsByAssignmentStatus, sortedEnrollmentsByEnrollmentDate } from './utils';
import { ASSIGNMENTS_EXPIRING_WARNING_LOCALSTORAGE_KEY } from '../../../data/constants';

export const useCourseEnrollments = ({
  enterpriseUUID,
  requestedCourseEnrollments,
}) => {
  const [courseEnrollmentsByStatus, setCourseEnrollmentsByStatus] = useState(groupCourseEnrollmentsByStatus([]));
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await service.fetchEnterpriseCourseEnrollments(enterpriseUUID);
        const enrollments = camelCaseObject(resp.data).map(transformCourseEnrollment);
        const enrollmentsByStatus = groupCourseEnrollmentsByStatus(enrollments);
        enrollmentsByStatus[COURSE_STATUSES.requested] = requestedCourseEnrollments;
        setCourseEnrollmentsByStatus(enrollmentsByStatus);
      } catch (error) {
        logError(error);
        setFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enterpriseUUID, requestedCourseEnrollments]);

  const updateCourseEnrollmentStatus = useCallback(({
    courseRunId,
    originalStatus,
    newStatus,
    savedForLater,
  }) => {
    const originalStatusCamelCased = _camelCase(originalStatus);
    const newStatusCamelCased = _camelCase(newStatus);

    const newCourseEnrollmentsByStatus = _cloneDeep(courseEnrollmentsByStatus);
    const courseEnrollmentToUpdate = newCourseEnrollmentsByStatus[originalStatusCamelCased].find(
      ce => ce.courseRunId === courseRunId,
    );
    newCourseEnrollmentsByStatus[
      originalStatusCamelCased
    ] = newCourseEnrollmentsByStatus[originalStatusCamelCased].filter(
      ce => ce.courseRunId !== courseRunId,
    );
    newCourseEnrollmentsByStatus[newStatusCamelCased].push({
      ...courseEnrollmentToUpdate,
      courseRunStatus: newStatus,
      savedForLater,
    });

    setCourseEnrollmentsByStatus(newCourseEnrollmentsByStatus);
  }, [courseEnrollmentsByStatus]);

  const removeCourseEnrollment = useCallback(({ courseRunId, enrollmentType }) => {
    const enrollmentIndex = courseEnrollmentsByStatus[enrollmentType].findIndex(
      ce => ce.courseRunId === courseRunId,
    );
    if (enrollmentIndex > -1) {
      const newCourseEnrollmentsByStatus = _cloneDeep(courseEnrollmentsByStatus);
      newCourseEnrollmentsByStatus[enrollmentType].splice(enrollmentIndex, 1);
      setCourseEnrollmentsByStatus(newCourseEnrollmentsByStatus);
    }
  }, [courseEnrollmentsByStatus]);

  return {
    courseEnrollmentsByStatus,
    isLoading,
    fetchError,
    updateCourseEnrollmentStatus,
    removeCourseEnrollment,
  };
};

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
 * @param {String} args.mode The mode of the course. Used as a gating mechanism for upgradability
 * default: false
 * @returns {Object} {
 *     licenseUpgradeUrl: undefined,
 *     couponUpgradeUrl: undefined,
 *     learnerCreditUpgradeUrl: undefined,
 *     subsidyForCourse: undefined,
 *     courseRunPrice: undefined,
 *     }
 */
export const useCourseUpgradeData = ({
  courseRunKey,
  mode,
}) => {
  const location = useLocation();
  // We determine whether the course mode is such that it can be upgraded
  const canUpgradeToVerifiedEnrollment = [COURSE_MODES_MAP.AUDIT, COURSE_MODES_MAP.HONOR].includes(mode);
  const { authenticatedUser } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: customerContainsContent } = useEnterpriseCustomerContainsContent([courseRunKey]);

  // TODO: Remove authenticatedUser?.administrator flag when rolling out ENT-9135
  // Metadata required to allow upgrade via applicable learner credit
  const { data: learnerCreditMetadata } = useCanUpgradeWithLearnerCredit(
    [courseRunKey],
    { enabled: authenticatedUser?.administrator && canUpgradeToVerifiedEnrollment },
  );

  // Metadata required to allow upgrade via applicable subscription license
  const { data: { subscriptionLicense: applicableSubscriptionLicense } } = useSubscriptions(
    { enabled: customerContainsContent?.containsContentItems && canUpgradeToVerifiedEnrollment },
  );

  // Metadata required to allow upgrade via applicable coupon codes
  const { data: couponCodesMetadata } = useCouponCodes({
    select: (data) => ({
      applicableCouponCode: findCouponCodeForCourse(data.couponCodeAssignments, customerContainsContent?.catalogList),
    }),
    enabled: canUpgradeToVerifiedEnrollment,
  });
  // If coupon codes are not eligible, there is no need to make this call
  const { data: courseRunDetails } = useCourseRunMetadata(courseRunKey, {
    select: (data) => ({
      ...data,
      sku: findHighestLevelSeatSku(data.seats),
      code: data.code,
    }),
    enabled: !couponCodesMetadata.applicableCouponCode && canUpgradeToVerifiedEnrollment,
  });

  return useMemo(() => {
    const defaultReturn = {
      licenseUpgradeUrl: undefined,
      couponUpgradeUrl: undefined,
      learnerCreditUpgradeUrl: undefined,
      subsidyForCourse: undefined,
      courseRunPrice: undefined,
    };

    // Exit early if the content to upgrade is not contained in the customers content or
    // if they are unable to upgrade due to their course mode
    if (!customerContainsContent?.containsContentItems || !canUpgradeToVerifiedEnrollment) {
      return defaultReturn;
    }

    // Construct and return subscription based upgrade url
    if (applicableSubscriptionLicense) {
      return {
        ...defaultReturn,
        subsidyForCourse: getSubsidyToApplyForCourse({ applicableSubscriptionLicense }),
        licenseUpgradeUrl: createEnrollWithLicenseUrl({
          courseRunKey,
          enterpriseId: enterpriseCustomer.uuid,
          licenseUUID: applicableSubscriptionLicense.uuid,
          location,
        }),
      };
    }

    // Construct and return coupon code based upgrade url
    if (couponCodesMetadata?.applicableCouponCode) {
      const { applicableCouponCode } = couponCodesMetadata;
      return {
        ...defaultReturn,
        subsidyForCourse: getSubsidyToApplyForCourse({ applicableCouponCode }),
        couponUpgradeUrl: createEnrollWithCouponCodeUrl({
          courseRunKey,
          sku: courseRunDetails.sku,
          code: applicableCouponCode.code,
          location,
        }),
        courseRunPrice: courseRunDetails.firstEnrollablePaidSeatPrice,
      };
    }

    // Construct and return learner credit based upgrade url
    if (learnerCreditMetadata?.applicableSubsidyAccessPolicy?.canRedeem) {
      const { applicableSubsidyAccessPolicy } = learnerCreditMetadata;
      return {
        ...defaultReturn,
        subsidyForCourse: getSubsidyToApplyForCourse({ applicableSubsidyAccessPolicy }),
        learnerCreditUpgradeUrl: applicableSubsidyAccessPolicy.redeemableSubsidyAccessPolicy?.policyRedemptionUrl,
      };
    }

    // If none is applicable, return with defaultReturn values
    return defaultReturn;
  }, [
    applicableSubscriptionLicense,
    canUpgradeToVerifiedEnrollment,
    couponCodesMetadata,
    courseRunDetails?.firstEnrollablePaidSeatPrice,
    courseRunDetails?.sku,
    courseRunKey,
    customerContainsContent?.containsContentItems,
    enterpriseCustomer.uuid,
    learnerCreditMetadata,
    location,
  ]);
};

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
    isLoading: isLoadingMutation,
  } = useAcknowledgeContentAssignments({ enterpriseId: enterpriseCustomer.uuid, userId });

  const handleAcknowledgeAssignments = useCallback(async ({ assignmentState }) => {
    const assignmentStateMap = {
      [ASSIGNMENT_TYPES.CANCELED]: 'isCanceledAssignment',
      [ASSIGNMENT_TYPES.EXPIRED]: 'isExpiredAssignment',
    };

    // Fail early if mutation is already in progress.
    if (isLoadingMutation) {
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
  }, [mutateAsync, assignments, isLoadingMutation]);

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

    // Sort and transform the list of assignments for display.
    const sortedAssignmentsForDisplay = sortAssignmentsByAssignmentStatus(assignmentsForDisplay);
    setAssignments(sortedAssignmentsForDisplay);

    // Determine whether there are expiring assignments. If so, display alert.
    const { hasUnacknowledgedExpiringAssignments } = getExpiringAssignmentsAcknowledgementState(assignmentsForDisplay);
    setShowExpiringAssignmentsAlert(hasUnacknowledgedExpiringAssignments);

    // Determine whether there are unacknowledged canceled assignments. If so, display alert.
    const hasUnacknowledgedCanceledAssignments = getHasUnacknowledgedAssignments(canceledAssignments);
    setShowCanceledAssignmentsAlert(hasUnacknowledgedCanceledAssignments);

    // Determine whether there are unacknowledged expired assignments. If so, display alert.
    const hasUnacknowledgedExpiredAssignments = getHasUnacknowledgedAssignments(expiredAssignments);
    setShowExpiredAssignmentsAlert(hasUnacknowledgedExpiredAssignments);
  }, [allEnrollmentsByStatus.assigned, enterpriseCustomer.slug]);

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

export const useUpdateCourseEnrollmentStatus = ({ enterpriseCustomer }) => {
  const queryClient = useQueryClient();

  const updateCourseEnrollmentStatus = useCallback(({ courseRunId, newStatus, savedForLater }) => {
    const enrollmentsQueryKey = queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid).queryKey;
    const existingEnrollments = queryClient.getQueryData(enrollmentsQueryKey);
    queryClient.setQueryData(
      enrollmentsQueryKey,
      existingEnrollments.map((enrollment) => {
        if (enrollment.courseRunId === courseRunId) {
          return {
            ...enrollment,
            courseRunStatus: newStatus,
            savedForLater,
          };
        }
        return enrollment;
      }),
    );
  }, [
    enterpriseCustomer.uuid,
    queryClient,
  ]);

  return updateCourseEnrollmentStatus;
};

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
