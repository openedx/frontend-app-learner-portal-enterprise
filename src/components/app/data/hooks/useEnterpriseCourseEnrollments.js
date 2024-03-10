import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

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

/**
 * Retrieves the relevant enterprise course enrollments, subsidy requests (e.g., license
 * requests), and content assignments for the active enterprise customer user.
 * @returns {Types.UseQueryResult}} The query results.
 */
export default function useEnterpriseCourseEnrollments() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: enterpriseCourseEnrollments } = useQuery({
    ...queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid),
    select: (data) => data.map(transformCourseEnrollment),
  });
  const { data: { requests } } = useBrowseAndRequest({
    subscriptionLicensesQueryOptions: {
      select: (data) => data.map((subsidyRequest) => transformSubsidyRequest({
        subsidyRequest,
        slug: enterpriseCustomer.slug,
      })),
    },
    couponCodesQueryOptions: {
      select: (data) => data.map((subsidyRequest) => transformSubsidyRequest({
        subsidyRequest,
        slug: enterpriseCustomer.slug,
      })),
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
        transformedAssignments[key] = value.map(transformLearnerContentAssignment);
      });
      return transformedAssignments;
    },
  });

  const allEnrollmentsByStatus = useMemo(() => {
    const enrollmentsByStatus = groupCourseEnrollmentsByStatus(enterpriseCourseEnrollments);
    const licenseRequests = requests.subscriptionLicenses;
    const couponCodeRequests = requests.couponCodes;
    const subsidyRequests = [].concat(licenseRequests).concat(couponCodeRequests);
    enrollmentsByStatus[COURSE_STATUSES.requested] = subsidyRequests;
    enrollmentsByStatus[COURSE_STATUSES.assigned] = contentAssignments;
    return enrollmentsByStatus;
  }, [enterpriseCourseEnrollments, requests, contentAssignments]);

  return useMemo(() => ({
    data: {
      allEnrollmentsByStatus,
      enterpriseCourseEnrollments,
      contentAssignments,
      requests,
    },
  }), [
    allEnrollmentsByStatus,
    enterpriseCourseEnrollments,
    contentAssignments,
    requests,
  ]);
}
