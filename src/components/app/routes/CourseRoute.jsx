import { Container } from '@edx/paragon';

import {
  useCourseMetadata,
  useCourseRedemptionEligibility,
  useEnterpriseCourseEnrollments,
  useUserEntitlements,
} from '../data';
import NotFoundPage from '../../NotFoundPage';

const CourseRoute = () => {
  const { data: courseMetadata } = useCourseMetadata();
  const { data: courseRedemptionEligiblity } = useCourseRedemptionEligibility();
  const {
    data: enterpriseCourseEnrollments,
    isLoading: isLoadingEnterpriseCourseEnrollments,
    isFetching: isFetchingEnterpriseCourseEnrollments,
  } = useEnterpriseCourseEnrollments();

  const {
    data: userEntitlements,
    isLoading: isUserEntitlementsLoading,
    isFetching: isUserEntitlementsFetching,
  } = useUserEntitlements();

  if (!courseMetadata) {
    return <NotFoundPage />;
  }

  return (
    <Container size="lg" className="py-4">
      <h2>Course</h2>
      <pre>
        {JSON.stringify(
          {
            courseMetadata: {
              title: courseMetadata.title,
              enrollmentUrl: courseMetadata.enrollmentUrl,
            },
            redeemableSubsidyAccessPolicy: courseRedemptionEligiblity.find(
              ({ canRedeem }) => canRedeem,
            )?.redeemableSubsidyAccessPolicy?.uuid ?? null,
            enterpriseCourseEnrollments: {
              isLoading: isLoadingEnterpriseCourseEnrollments,
              isFetching: isFetchingEnterpriseCourseEnrollments,
              count: enterpriseCourseEnrollments?.length || 0,
            },
            userEntitlements: {
              isLoading: isUserEntitlementsLoading,
              isFetching: isUserEntitlementsFetching,
              count: userEntitlements?.length || 0,
            },
          },
          null,
          2,
        )}
      </pre>
    </Container>
  );
};

export default CourseRoute;
