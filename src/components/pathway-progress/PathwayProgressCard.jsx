import { Card, Truncate } from '@openedx/paragon';
import PropTypes from 'prop-types';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { Link } from 'react-router-dom';
import { getProgressFromSteps } from './data/utils';
import { ProgressCategoryBubbles } from '../progress-category-bubbles';
import { useEnterpriseCustomer } from '../app/data';

const PathwayProgressCard = ({ pathway: { learnerPathwayProgress } }) => {
  const progress = getProgressFromSteps(learnerPathwayProgress.steps);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return (
    <Card
      className="progress-listing-card d-inline-flex"
      isClickable
      as={Link}
      to={`/${enterpriseCustomer.slug}/pathway/${learnerPathwayProgress.uuid}/progress`}
    >
      <Card.ImageCap
        src={learnerPathwayProgress.cardImage || cardFallbackImg}
        fallbackSrc={cardFallbackImg}
        className="banner-image"
        data-testid="pathway-card-image"
        srcAlt="dug"
      />
      <Card.Header
        title={(
          <Truncate lines={2}>{learnerPathwayProgress.title}</Truncate>
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
