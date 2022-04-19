import React, { useContext } from 'react';
import { CourseContext } from './CourseContextProvider';
import CourseRecommendationCard from './CourseRecommendationCard';

const CourseRecommendations = () => {
  const { state } = useContext(CourseContext);
  const { course, courseRecommendations } = state;
  const { allRecommendations, samePartnerRecommendations } = courseRecommendations;

  return (
    <div className="mt-1">
      { allRecommendations?.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-3"> Courses you may like: </h3>
          <div className="course-recommendations">
            { allRecommendations.map(
              recommendation => <CourseRecommendationCard course={recommendation} />,
            )}
          </div>
        </div>
      )}
      { samePartnerRecommendations?.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-3"> More from { course.owners[0].name }: </h3>
          <div className="partner-recommendations">
            { samePartnerRecommendations.map(
              recommendation => <CourseRecommendationCard course={recommendation} isPartnerRecommendation />,
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRecommendations;
