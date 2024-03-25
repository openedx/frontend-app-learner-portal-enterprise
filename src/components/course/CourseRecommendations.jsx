import React, { useContext } from 'react';
import { CardGrid } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { CourseContext } from './CourseContextProvider';
import CourseRecommendationCard from './CourseRecommendationCard';

const CourseRecommendations = () => {
  return null;

  // TODO:
  const { state } = useContext(CourseContext);
  const { course, courseRecommendations } = state;
  const { allRecommendations, samePartnerRecommendations } = courseRecommendations;
  return (
    <div className="mt-1">
      {allRecommendations?.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-3">
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.recommendations"
              defaultMessage="Courses you may like:"
              description="Title for the section that lists the courses that are recommended."
            />
          </h3>
          <CardGrid>
            {allRecommendations.map(recommendation => (
              <CourseRecommendationCard key={recommendation.key} course={recommendation} />
            ))}
          </CardGrid>
        </div>
      )}
      {samePartnerRecommendations?.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-3">
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.recommendations.same.partner"
              defaultMessage="More from { firstCourseOwner }:"
              description="Title for the section that lists the courses that are recommended from the same partner."
              values={{ firstCourseOwner: course.owners[0].name }}
            />
          </h3>
          <CardGrid>
            {samePartnerRecommendations.map(recommendation => (
              <CourseRecommendationCard
                key={recommendation.key}
                course={recommendation}
                isPartnerRecommendation
              />
            ))}
          </CardGrid>
        </div>
      )}
    </div>
  );
};

export default CourseRecommendations;
