import React, { useContext } from 'react';
import { Card } from '@edx/paragon';
import LinesEllipsis from 'react-lines-ellipsis';
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
      className="progress-listing-card"
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
          <LinesEllipsis
            text={learnerPathwayProgress.title}
            maxLine={2}
            trimWhitespace
          />
        )}
      />
      <Card.Section />
      <Card.Section>
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
      steps: PropTypes.arrayOf(PropTypes.shape()).isRequired,
      title: PropTypes.string.isRequired,
      uuid: PropTypes.string.isRequired,
      cardImage: PropTypes.string,
    }),
  }).isRequired,
};
export default PathwayProgressCard;
