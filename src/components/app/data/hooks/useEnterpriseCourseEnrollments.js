import { useMemo } from 'react';

import { queryEnterpriseCourseEnrollments } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useBrowseAndRequest from './useBrowseAndRequest';
import useRedeemablePolicies from './useRedeemablePolicies';
import {
  groupCourseEnrollmentsByStatus,
  transformCourseEnrollment,
  transformLearnerContentAssignment,
  transformSubsidyRequest,
} from '../utils';
import { COURSE_STATUSES } from '../../../../constants';
import useBFF from './useBFF';

export const transformAllEnrollmentsByStatus = ({
  enrollmentsByStatus,
  requests,
  contentAssignments,
}) => {
  const allEnrollmentsByStatus = { ...enrollmentsByStatus };
  const licenseRequests = requests.subscriptionLicenses || [];
  const couponCodeRequests = requests.couponCodes || [];
  const subsidyRequests = [].concat(licenseRequests).concat(couponCodeRequests);
  allEnrollmentsByStatus[COURSE_STATUSES.requested] = subsidyRequests;
  allEnrollmentsByStatus[COURSE_STATUSES.assigned] = contentAssignments || [];
  return allEnrollmentsByStatus;
};

/**
 * Retrieves the relevant enterprise course enrollments, subsidy requests (e.g., license
 * requests), and content assignments for the active enterprise customer user.
 * @param {Types.UseQueryOptions} queryOptions The query options.
 * @returns {Types.UseQueryResult} The query results.
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
  const { select: selectContentAssignment, ...contentAssignmentQueryOptionsRest } = contentAssignmentQueryOptions;

  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const { data: enterpriseCourseEnrollments } = useBFF({
    bffQueryOptions: {
      ...queryOptions,
      select: (data) => {
        const enrollments = data.enterpriseCourseEnrollments.map(transformCourseEnrollment);
        const transformedData = {
          enrollments,
          enrollmentsByStatus: groupCourseEnrollmentsByStatus(enrollments),
        };
        // const transformedData = {
        //   enrollments: data.enterpriseCourseEnrollments,
        //   enrollmentsByStatus: data.allEnrollmentsByStatus,
        // };
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

  const { data: contentAssignments } = useRedeemablePolicies({
    select: (data) => {
      const { learnerContentAssignments } = data;
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
      if (selectContentAssignment) {
        return selectContentAssignment({
          original: data,
          transformed: transformedAssignments,
        });
      }
      return transformedAssignments;
    },
    ...contentAssignmentQueryOptionsRest,
  });

  // TODO: Talk about how we don't have access to weeksToComplete on the dashboard page.
  const allEnrollmentsByStatus = useMemo(() => transformAllEnrollmentsByStatus({
    enrollmentsByStatus: enterpriseCourseEnrollments.enrollmentsByStatus,
    requests,
    contentAssignments,
  }), [contentAssignments, enterpriseCourseEnrollments.enrollmentsByStatus, requests]);

  return useMemo(() => ({
    data: {
      allEnrollmentsByStatus,
      enterpriseCourseEnrollments: enterpriseCourseEnrollments.enrollments,
      contentAssignments,
      requests,
    },
  }), [
    allEnrollmentsByStatus,
    enterpriseCourseEnrollments.enrollments,
    contentAssignments,
    requests,
  ]);
}
