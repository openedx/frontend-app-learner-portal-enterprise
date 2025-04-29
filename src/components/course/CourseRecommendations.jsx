import { useMemo } from 'react';
import { CardGrid, Skeleton } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import CourseRecommendationCard from './CourseRecommendationCard';
import { useCourseMetadata, useCourseRecommendations } from '../app/data';

const CourseRecommendations = () => {
  const { data: courseMetadata } = useCourseMetadata();
  const {
    isPending,
    data: recommendationsData,
  } = useCourseRecommendations();

  const allRecommendations = useMemo(
    () => recommendationsData?.allRecommendations || [],
    [recommendationsData?.allRecommendations],
  );
  const samePartnerRecommendations = useMemo(
    () => recommendationsData?.samePartnerRecommendations || [],
    [recommendationsData?.samePartnerRecommendations],
  );

  const allRecommendationsCards = useMemo(() => allRecommendations.map(recommendation => (
    <CourseRecommendationCard key={recommendation.key} course={recommendation} />
  )), [allRecommendations]);
  const samePartnerRecommendationsCards = useMemo(() => samePartnerRecommendations.map(recommendation => (
    <CourseRecommendationCard
      key={recommendation.key}
      course={recommendation}
      isPartnerRecommendation
    />
  )), [samePartnerRecommendations]);

  return (
    <div className="mt-1">
      {(isPending || allRecommendationsCards.length > 0) && (
        <div className="mb-3">
          <h3 className="mb-3">
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.recommendations"
              defaultMessage="Courses you may like:"
              description="Title for the section that lists the courses that are recommended."
            />
          </h3>
          {isPending ? (
            <Skeleton height={60} count={3} />
          ) : (
            <CardGrid>{allRecommendationsCards}</CardGrid>
          )}
        </div>
      )}
      {(isPending || samePartnerRecommendations.length > 0) && (
        <div className="mb-3">
          <h3 className="mb-3">
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.recommendations.same.partner"
              defaultMessage="More from { firstCourseOwner }:"
              description="Title for the section that lists the courses that are recommended from the same partner."
              values={{ firstCourseOwner: courseMetadata.owners[0].name }}
            />
          </h3>
          {isPending ? (
            <Skeleton height={60} count={3} />
          ) : (
            <CardGrid>{samePartnerRecommendationsCards}</CardGrid>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseRecommendations;
