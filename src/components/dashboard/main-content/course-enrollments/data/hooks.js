import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import _camelCase from 'lodash.camelcase';
import _cloneDeep from 'lodash.clonedeep';

import * as service from './service';
import {
  getTransformedAllocatedAssignments,
  groupCourseEnrollmentsByStatus,
  sortAssignmentsByAssignmentStatus,
  sortedEnrollmentsByEnrollmentDate,
  transformCourseEnrollment,
} from './utils';
import { COURSE_STATUSES } from './constants';
import CourseService from '../../../../course/data/service';
import {
  createEnrollWithCouponCodeUrl,
  createEnrollWithLicenseUrl,
  findCouponCodeForCourse,
  findHighestLevelSeatSku,
  getSubsidyToApplyForCourse,
} from '../../../../course/data/utils';
import {
  getHasUnacknowledgedCanceledAssignments,
  getHasUnacknowledgedExpiredAssignments,
} from '../../../data/utils';
import { ASSIGNMENT_TYPES } from '../../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { enterpriseUserSubsidyQueryKeys } from '../../../../enterprise-user-subsidy/data/constants';

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
 * @param {object} args Arguments.
 * @param {String} args.courseRunKey id of the course run
 * @param {String} args.enterpriseId UUID of the enterprise
 * @param {Object} args.subscriptionLicense the user's subscription license
 * @param {Object} args.location location object from useLocation()
 *
 * @returns {Object} { isLoading, licenseUpgradeUrl, couponUpgradeUrl, upgradeUrl }
 */
export const useCourseUpgradeData = ({
  courseRunKey,
  enterpriseId,
  subscriptionLicense,
  couponCodes,
  location,
}) => {
  const [licenseUpgradeUrl, setLicenseUpgradeUrl] = useState();
  const [couponUpgradeUrl, setCouponUpgradeUrl] = useState();
  const [subsidyForCourse, setSubsidyForCourse] = useState();
  const [courseRunPrice, setCourseRunPrice] = useState();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const courseService = new CourseService({
      enterpriseUuid: enterpriseId,
      courseKey: null,
      courseRunKey,
    });

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const containsContentResponse = await courseService.fetchEnterpriseCustomerContainsContent([courseRunKey]);
        const { containsContentItems, catalogList } = camelCaseObject(containsContentResponse.data);

        // Don't do anything if the course is not part of the enterprise's catalog
        if (!containsContentItems) {
          return;
        }

        if (subscriptionLicense) {
          // get subscription license with extra information (i.e. discount type, discount value, subsidy checksum)
          const fetchUserLicenseSubsidyResponse = await courseService.fetchUserLicenseSubsidy(courseRunKey);
          const licenseSubsidy = camelCaseObject(fetchUserLicenseSubsidyResponse.data);
          if (licenseSubsidy) {
            const url = createEnrollWithLicenseUrl({
              courseRunKey,
              enterpriseId,
              licenseUUID: subscriptionLicense.uuid,
              location,
            });

            setSubsidyForCourse({ getSubsidyToApplyForCourse: licenseSubsidy });
            setLicenseUpgradeUrl(url);
            return;
          }
        }

        const couponSubsidy = findCouponCodeForCourse(couponCodes, catalogList);
        if (couponSubsidy) {
          const fetchCourseRunResponse = await courseService.fetchCourseRun(courseRunKey);
          const courseRunDetails = camelCaseObject(fetchCourseRunResponse.data);
          const sku = findHighestLevelSeatSku(courseRunDetails.seats);
          const url = createEnrollWithCouponCodeUrl({
            courseRunKey,
            sku,
            code: couponSubsidy.code,
            location,
          });
          setSubsidyForCourse(getSubsidyToApplyForCourse({ applicableCouponCode: couponSubsidy }));
          setCouponUpgradeUrl(url);
          setCourseRunPrice(courseRunDetails.firstEnrollablePaidSeatPrice);
        }
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseRunKey, enterpriseId, subscriptionLicense, location, couponCodes]);

  return {
    isLoading,
    subsidyForCourse,
    licenseUpgradeUrl,
    couponUpgradeUrl,
    courseRunPrice,
  };
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
    onSuccess: () => {
      // Invalidate the query for the redeemable policies in order to trigger refetch of `credits_available` API,
      // returning the updated assignments list per policy, excluding now-acknowledged assignments.
      queryClient.invalidateQueries({
        queryKey: enterpriseUserSubsidyQueryKeys.redeemablePolicies(enterpriseId, userId),
      });
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
export function useContentAssignments(redeemableLearnerCreditPolicies) {
  const {
    enterpriseConfig: {
      uuid: enterpriseId,
      slug: enterpriseSlug,
    },
    authenticatedUser: { userId },
  } = useContext(AppContext);

  const [assignments, setAssignments] = useState([]);
  const [showCanceledAssignmentsAlert, setShowCanceledAssignmentsAlert] = useState(false);
  const [showExpiredAssignmentsAlert, setShowExpiredAssignmentsAlert] = useState(false);

  const {
    mutate,
    isLoading: isLoadingMutation,
  } = useAcknowledgeContentAssignments({ enterpriseId, userId });

  const handleAcknowledgeAssignments = useCallback(({ assignmentState }) => {
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
      const isRequestedStateActive = !!assignment[assignmentStateProperty];

      // Check whether assignment is in requested state. If not, skip.
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
    mutate({ assignmentsByAssignmentConfiguration });
  }, [mutate, assignments, isLoadingMutation]);

  /**
   * Parses the learner content assignments from the redeemableLearnerCreditPolicies
   * response and filters out any canceled/expired assignments that have already been
   * acknowledged (dismissed) by the learner.
   */
  useEffect(() => {
    if (!redeemableLearnerCreditPolicies) {
      // No policies available (yet). Return early.
      return;
    }
    const {
      assignmentsForDisplay,
      canceledAssignments,
      expiredAssignments,
    } = redeemableLearnerCreditPolicies.learnerContentAssignments;

    // Sort and transform the list of assignments for display.
    const sortedAssignmentsForDisplay = sortAssignmentsByAssignmentStatus(assignmentsForDisplay);
    const transformedAssignmentsForDisplay = getTransformedAllocatedAssignments(
      sortedAssignmentsForDisplay,
      enterpriseSlug,
    );
    setAssignments(transformedAssignmentsForDisplay);

    // Determine whether there are unacknowledged canceled assignments. If so, display alert.
    const hasUnacknowledgedCanceledAssignments = getHasUnacknowledgedCanceledAssignments(canceledAssignments);
    setShowCanceledAssignmentsAlert(hasUnacknowledgedCanceledAssignments);

    // Determine whether there are unacknowledged expired assignments. If so, display alert.
    const hasUnacknowledgedExpiredAssignments = getHasUnacknowledgedExpiredAssignments(expiredAssignments);
    setShowExpiredAssignmentsAlert(hasUnacknowledgedExpiredAssignments);
  }, [redeemableLearnerCreditPolicies, enterpriseSlug]);

  return {
    assignments,
    showCanceledAssignmentsAlert,
    showExpiredAssignmentsAlert,
    handleAcknowledgeAssignments,
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
export function useCourseEnrollmentsBySection({ assignments, courseEnrollmentsByStatus }) {
  const currentCourseEnrollments = useMemo(
    () => {
      const courseEnrollmentsByStatusCopy = { ...courseEnrollmentsByStatus };
      Object.keys(courseEnrollmentsByStatusCopy).forEach((status) => {
        courseEnrollmentsByStatusCopy[status] = courseEnrollmentsByStatusCopy[status].map((course) => {
          const isAssigned = assignments?.some(assignment => (assignment?.state === ASSIGNMENT_TYPES.ACCEPTED
            && course.courseRunId.includes(assignment?.contentKey)));
          if (isAssigned) {
            return { ...course, isCourseAssigned: true };
          }
          return course;
        });
      });
      return sortedEnrollmentsByEnrollmentDate(
        [
          ...courseEnrollmentsByStatusCopy.inProgress,
          ...courseEnrollmentsByStatusCopy.upcoming,
          ...courseEnrollmentsByStatusCopy.requested,
        ],
      );
    },
    [assignments, courseEnrollmentsByStatus],
  );

  const completedCourseEnrollments = useMemo(
    () => sortedEnrollmentsByEnrollmentDate(courseEnrollmentsByStatus.completed),
    [courseEnrollmentsByStatus.completed],
  );

  const savedForLaterCourseEnrollments = useMemo(
    () => sortedEnrollmentsByEnrollmentDate(courseEnrollmentsByStatus.savedForLater),
    [courseEnrollmentsByStatus.savedForLater],
  );

  const hasCourseEnrollments = Object.values(courseEnrollmentsByStatus).flat().length > 0;

  return {
    hasCourseEnrollments,
    currentCourseEnrollments,
    completedCourseEnrollments,
    savedForLaterCourseEnrollments,
  };
}
