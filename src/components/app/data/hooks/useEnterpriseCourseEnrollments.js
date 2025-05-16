import { useMemo, useCallback } from 'react';

import { queryEnterpriseCourseEnrollments } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useBrowseAndRequest from './useBrowseAndRequest';
import useRedeemablePolicies from './useRedeemablePolicies';
import {
  groupCourseEnrollmentsByStatus,
  transformCourseEnrollment,
  transformLearnerContentAssignment,
  transformLearnerCreditRequest,
  transformSubsidyRequest,
} from '../utils';
import { COURSE_STATUSES } from '../../../../constants';
import { useSuspenseBFF } from './useBFF';

export const transformAllEnrollmentsByStatus = ({
  enrollmentsByStatus,
  requests,
  contentAssignments,
  learnerCreditRequests,
}) => {
  const allEnrollmentsByStatus = { ...enrollmentsByStatus };
  const licenseRequests = requests.subscriptionLicenses || [];
  const couponCodeRequests = requests.couponCodes || [];
  const subsidyRequests = [].concat(licenseRequests).concat(couponCodeRequests);

  const assignmentsForDisplay = contentAssignments?.assignmentsForDisplay || [];
  const assignmentsWithRequests = contentAssignments || {};
  assignmentsWithRequests.assignmentsForDisplay = [
    ...learnerCreditRequests,
    ...assignmentsForDisplay,
  ];

  allEnrollmentsByStatus[COURSE_STATUSES.requested] = subsidyRequests;
  allEnrollmentsByStatus[COURSE_STATUSES.assigned] = assignmentsWithRequests || [];
  return allEnrollmentsByStatus;
};

/**
 * Retrieves the relevant enterprise course enrollments, subsidy requests (e.g., license
 * requests), and content assignments for the active enterprise customer user.
 * @param {object} queryOptions The query options.
 * @returns The query results.
 */
export default function useEnterpriseCourseEnrollments(queryOptions = {}) {
  const {
    enrollmentQueryOptions = {},
    licenseRequestQueryOptions = {},
    couponCodeRequestQueryOptions = {},
    contentAssignmentQueryOptions = {},
  } = queryOptions;
  const { select: selectEnrollment, ...enrollmentQueryOptionsRest } = enrollmentQueryOptions;
  const { select: selectLicenseRequest, ...licenseRequestQueryOptionsRest } = licenseRequestQueryOptions;
  const { select: selectCouponCodeRequest, ...couponCodeRequestQueryOptionsRest } = couponCodeRequestQueryOptions;
  const { select: selectContentAssignment } = contentAssignmentQueryOptions;

  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const { data: enterpriseCourseEnrollments } = useSuspenseBFF({
    bffQueryOptions: {
      ...queryOptions,
      select: (data) => {
        const transformedData = {
          enrollments: data.enterpriseCourseEnrollments,
          enrollmentsByStatus: data.allEnrollmentsByStatus,
        };
        if (selectEnrollment) {
          return selectEnrollment({
            original: data,
            transformed: transformedData,
          });
        }
        return transformedData;
      },
      ...enrollmentQueryOptionsRest,
    },
    fallbackQueryConfig: {
      ...queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid),
      ...queryOptions,
      select: (data) => {
        const enrollments = data.map(transformCourseEnrollment);
        const transformedData = {
          enrollments,
          enrollmentsByStatus: groupCourseEnrollmentsByStatus(enrollments),
        };
        if (selectEnrollment) {
          return selectEnrollment({
            original: data,
            transformed: transformedData,
          });
        }
        return transformedData;
      },
      ...enrollmentQueryOptionsRest,
    },
  });

  const { data: { requests } } = useBrowseAndRequest({
    subscriptionLicensesQueryOptions: {
      select: (data) => {
        const transformedData = data.map((subsidyRequest) => transformSubsidyRequest({
          subsidyRequest,
          slug: enterpriseCustomer.slug,
        }));
        if (selectLicenseRequest) {
          return selectLicenseRequest({
            original: data,
            transformed: transformedData,
          });
        }
        return transformedData;
      },
      ...licenseRequestQueryOptionsRest,
    },
    couponCodesQueryOptions: {
      select: (data) => {
        const transformedData = data.map((subsidyRequest) => transformSubsidyRequest({
          subsidyRequest,
          slug: enterpriseCustomer.slug,
        }));
        if (selectCouponCodeRequest) {
          return selectCouponCodeRequest({
            original: data,
            transformed: transformedData,
          });
        }
        return transformedData;
      },
      ...couponCodeRequestQueryOptionsRest,
    },
  });

  /* We kept the learner credit requests in the same place as the learner content assignments
   * because they are both used in the same place in the UI (Pending Enrollents Section). The
   * api `credits_available` returns both of them in the same response. We tried to utilize the
   * existing rendering flow of the learner content assignments. Therefore, we are transforming
   * the learner credit requests to match assignments' structure.
  */
  const selectRedeemablePoliciesCallback = useCallback((data) => {
    const { learnerContentAssignments, learnerRequests } = data;
    const transformedAssignments = {};
    Object.entries(learnerContentAssignments).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        return;
      }

      transformedAssignments[key] = value.map((item) => transformLearnerContentAssignment(
        item,
        enterpriseCustomer.slug,
      ));
    });

    let finalAssignments = transformedAssignments;
    if (selectContentAssignment) {
      finalAssignments = selectContentAssignment({
        original: data,
        transformed: transformedAssignments,
      });
    }

    const transformedRequests = learnerRequests?.map(
      (request) => transformLearnerCreditRequest(request, enterpriseCustomer.slug),
    ) || [];
    return { assignments: finalAssignments, transformedRequests };
  }, [enterpriseCustomer.slug, selectContentAssignment]);

  const { data: redeemableData } = useRedeemablePolicies({
    select: selectRedeemablePoliciesCallback,
  });

  const contentAssignments = redeemableData?.assignments;
  const learnerCreditRequests = redeemableData?.transformedRequests;

  // TODO: Talk about how we don't have access to weeksToComplete on the dashboard page.
  const allEnrollmentsByStatus = useMemo(() => transformAllEnrollmentsByStatus({
    enrollmentsByStatus: enterpriseCourseEnrollments?.enrollmentsByStatus,
    requests,
    contentAssignments,
    learnerCreditRequests,
  }), [contentAssignments, enterpriseCourseEnrollments.enrollmentsByStatus, requests, learnerCreditRequests]);

  return useMemo(() => ({
    data: {
      allEnrollmentsByStatus,
      enterpriseCourseEnrollments: enterpriseCourseEnrollments.enrollments,
      contentAssignments,
      requests,
      learnerCreditRequests,
    },
  }), [
    allEnrollmentsByStatus,
    enterpriseCourseEnrollments.enrollments,
    contentAssignments,
    requests,
    learnerCreditRequests,
  ]);
}
