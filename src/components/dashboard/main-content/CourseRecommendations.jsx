import { Button } from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import SkillsQuizImage from '../../../assets/images/skills-quiz/skills-quiz.png';
import { useEnterpriseCustomer } from '../../app/data';

const CourseRecommendations = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return (
    <div className="course-recommendations">
      <h2 className="course-recommendations-title">
        <FormattedMessage
          id="enterprise.dashboard.tab.courses.recommendation.section.title"
          defaultMessage="Get course recommendations for you."
          description="Title of course recommendation section in enterprise dashboard on courses tab."
        />
      </h2>
      <div className="row course-recommendations-details">
        <div className="col-lg-6 col-sm-12">
          <p>
            <FormattedMessage
              id="enterprise.dashboard.tab.courses.recommendation.section.description"
              defaultMessage="Take a two-minute quiz to tell us more about the skills and jobs you are interested in, and immediately receive recommendations for the best learning experiences in the catalog for you."
              description="Description of course recommendation section in enterprise dashboard on courses tab."
            />
          </p>
          <Button
            as={Link}
            to={`/${enterpriseCustomer.slug}/skills-quiz`}
            className="btn-brand-primary d-block d-md-inline-block"
          >
            <FormattedMessage
              id="enterprise.dashboard.tab.courses.recommendation.section.button"
              defaultMessage="Recommend courses for me"
              description="Label of button that will take a learner to the skills quiz page."
            />
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
