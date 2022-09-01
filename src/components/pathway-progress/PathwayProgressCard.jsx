import React, { useContext } from 'react';
import { Card } from '@edx/paragon';
import Truncate from 'react-truncate';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getProgressFromSteps } from './data/utils';
import { ProgressCategoryBubbles } from '../progress-category-bubbles';

const PathwayProgressCard = ({ pathway: { learnerPathwayProgress } }) => {
  const progress = getProgressFromSteps(learnerPathwayProgress.steps);
  const history = useHistory();
  const { enterpriseConfig: { slug } } = useContext(AppContext);
  const redirectToProgressDetailPage = () => {
    history.push(`/${slug}/pathway/${learnerPathwayProgress.uuid}/progress`);
  };
  return (
    <Card
      className="mb-4 progress-listing-card mr-5"
      isClickable
      onClick={redirectToProgressDetailPage}
    >
      <Card.ImageCap
        src={learnerPathwayProgress.cardImage}
        className="banner-image"
        data-testid="pathway-card-image"
        srcAlt="dug"
      />

      <Card.Header
        title={(
          <Truncate lines={2} trimWhitespace>
            {learnerPathwayProgress.title}
          </Truncate>
        )}
      />

      <Card.Section className="py-3">
        <ProgressCategoryBubbles
          inProgress={progress.inProgress}
          notStarted={progress.notStarted}
          completed={progress.completed}
        />
      </Card.Section>
    </Card>
  );
};

PathwayProgressCard.propTypes = {
  pathway: PropTypes.shape({
    learnerPathwayProgress: PropTypes.shape({
      steps: PropTypes.array.isRequired,
      title: PropTypes.string.isRequired,
      uuid: PropTypes.string.isRequired,
      cardImage: PropTypes.string,
    }),
  }).isRequired,
};
export default PathwayProgressCard;
