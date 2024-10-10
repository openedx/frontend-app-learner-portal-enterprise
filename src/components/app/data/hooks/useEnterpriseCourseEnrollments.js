import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

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
import { resolveBFFQuery } from '../../routes/data/utils';
import { COURSE_STATUSES } from '../../../../constants';

export const transformAllEnrollmentsByStatus = ({
  enterpriseCourseEnrollments,
  requests,
  contentAssignments,
}) => {
  const enrollmentsByStatus = groupCourseEnrollmentsByStatus(enterpriseCourseEnrollments);
  const licenseRequests = requests?.subscriptionLicenses || [];
  const couponCodeRequests = requests.couponCodes || [];
  const subsidyRequests = [].concat(licenseRequests).concat(couponCodeRequests);
  enrollmentsByStatus[COURSE_STATUSES.requested] = subsidyRequests;
  enrollmentsByStatus[COURSE_STATUSES.assigned] = contentAssignments || [];
  return enrollmentsByStatus;
};

export function useBaseEnterpriseCourseEnrollments(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const location = useLocation();

  // Determine the BFF query to use based on the current location
  const matchedBFFQuery = resolveBFFQuery(location.pathname);

  // Determine the query configuration: use the matched BFF query or fallback to default
  let queryConfig;
  if (matchedBFFQuery) {
    queryConfig = {
      ...matchedBFFQuery(enterpriseCustomer.uuid),
      // TODO: move transforms into the BFF response
      select: (data) => data.enterpriseCourseEnrollments.map(transformCourseEnrollment),
    };
  } else {
    queryConfig = {
      ...queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid),
      select: (data) => data.map(transformCourseEnrollment),
    };
  }

  return useQuery({
    ...queryConfig,
    enabled: queryOptions.enabled,
  });
}

/**
 * Retrieves the relevant enterprise course enrollments, subsidy requests (e.g., license
 * requests), and content assignments for the active enterprise customer user.
 * @returns {Types.UseQueryResult} The query results.
 */
export default function useEnterpriseCourseEnrollments(queryOptions = {}) {
  const isEnabled = queryOptions.enabled;
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: enterpriseCourseEnrollments } = useBaseEnterpriseCourseEnrollments(queryOptions);
  const { data: { requests } } = useBrowseAndRequest({
    subscriptionLicensesQueryOptions: {
      select: (data) => data.map((subsidyRequest) => transformSubsidyRequest({
        subsidyRequest,
        slug: enterpriseCustomer.slug,
      })),
      enabled: isEnabled,
    },
    couponCodesQueryOptions: {
      select: (data) => data.map((subsidyRequest) => transformSubsidyRequest({
        subsidyRequest,
        slug: enterpriseCustomer.slug,
      })),
      enabled: isEnabled,
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
      return transformedAssignments;
    },
    enabled: isEnabled,
  });
  // TODO: Talk about how we don't have access to weeksToComplete on the dashboard page.
  const allEnrollmentsByStatus = useMemo(() => transformAllEnrollmentsByStatus({
    enterpriseCourseEnrollments,
    requests,
    contentAssignments,
  }), [contentAssignments, enterpriseCourseEnrollments, requests]);

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
