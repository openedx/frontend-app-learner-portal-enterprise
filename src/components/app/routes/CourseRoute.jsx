import { useParams } from 'react-router-dom';
import { Container } from '@openedx/paragon';

import {
  useCourseMetadata,
  useCourseRedemptionEligibility,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomerContainsContent,
  useUserEntitlements,
} from '../data';
import NotFoundPage from '../../NotFoundPage';

const CourseRoute = () => {
  const { courseKey } = useParams();
  const { data: courseMetadata } = useCourseMetadata();
  const { data: courseRedemptionEligiblity } = useCourseRedemptionEligibility();
  const {
    data: enterpriseCourseEnrollments,
    isLoading: isLoadingEnterpriseCourseEnrollments,
    isFetching: isFetchingEnterpriseCourseEnrollments,
  } = useEnterpriseCourseEnrollments();
  const { data: containsContent } = useEnterpriseCustomerContainsContent([courseKey]);

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
            containsContent,
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
