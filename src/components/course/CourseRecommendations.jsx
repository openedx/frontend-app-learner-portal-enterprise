import React, { useContext } from 'react';
import { CardGrid } from '@openedx/paragon';
import { CourseContext } from './CourseContextProvider';
import CourseRecommendationCard from './CourseRecommendationCard';

const CourseRecommendations = () => {
  const { state } = useContext(CourseContext);
  const { course, courseRecommendations } = state;
  const { allRecommendations, samePartnerRecommendations } = courseRecommendations;

  return (
    <div className="mt-1">
      {allRecommendations?.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-3">Courses you may like:</h3>
          <CardGrid>
            {allRecommendations.map(recommendation => (
              <CourseRecommendationCard key={recommendation.key} course={recommendation} />
            ))}
          </CardGrid>
        </div>
      )}
      {samePartnerRecommendations?.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-3">More from { course.owners[0].name }:</h3>
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
