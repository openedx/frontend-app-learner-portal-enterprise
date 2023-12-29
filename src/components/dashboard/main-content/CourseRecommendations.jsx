import React, { useContext } from 'react';
import { Button } from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import SkillsQuizImage from '../../../assets/images/skills-quiz/skills-quiz.png';

const CourseRecommendations = () => {
  const {
    enterpriseConfig: {
      slug,
    },
  } = useContext(AppContext);

  return (
    <div className="course-recommendations">
      <h2 className="course-recommendations-title">Get course recommendations for you.</h2>
      <div className="row course-recommendations-details">
        <div className="col-lg-6 col-sm-12">
          <p>
            Take a two-minute quiz to tell us more about the skills and jobs you are interested in,
            and immediately receive recommendations for the best learning experiences in the catalog for you.
          </p>
          <Button
            as={Link}
            to={`/${slug}/skills-quiz`}
            className="btn-brand-primary d-block d-md-inline-block"
          >
            Recommend courses for me
          </Button>
        </div>
        <div className="col-lg-6 col-sm-12">
          <img className="course-recommendations-image" src={SkillsQuizImage} alt="Skills Quiz CTA" />
        </div>
      </div>
    </div>
  );
};

export default CourseRecommendations;
