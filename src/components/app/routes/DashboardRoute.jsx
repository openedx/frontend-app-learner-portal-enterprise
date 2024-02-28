import { Container } from '@openedx/paragon';

import { useEnterpriseCourseEnrollments, useEnterpriseCustomerUserSubsidies } from '../data';

/**
 * TODO
 * @returns
 */
const DashboardRoute = () => {
  const { data: enterpriseCustomerUserSubsidies } = useEnterpriseCustomerUserSubsidies();
  const {
    data: enterpriseCourseEnrollments,
    isLoading: isLoadingEnterpriseCourseEnrollments,
    isFetching: isFetchingEnterpriseCourseEnrollments,
  } = useEnterpriseCourseEnrollments();

  return (
    <Container size="lg" className="py-4">
      <h2>Dashboard</h2>
      <pre>
        {JSON.stringify(
          {
            enterpriseCourseEnrollments: {
              isLoading: isLoadingEnterpriseCourseEnrollments,
              isFetching: isFetchingEnterpriseCourseEnrollments,
              count: enterpriseCourseEnrollments?.length,
            },
            enterpriseCustomerUserSubsidies,
          },
          null,
          2,
        )}
      </pre>
    </Container>
  );
};

export default DashboardRoute;
