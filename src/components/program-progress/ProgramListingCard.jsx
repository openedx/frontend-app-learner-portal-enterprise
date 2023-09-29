import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { useHistory } from 'react-router-dom';

import { AppContext } from '@edx/frontend-platform/react';

import Truncate from 'react-truncate';
import { getProgramIcon } from '../course/data/utils';
import { ProgressCategoryBubbles } from '../progress-category-bubbles';

const ProgramListingCard = ({ program }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const history = useHistory();

  const handleCardClick = () => {
    history.push(`/${enterpriseConfig.slug}/program/${program.uuid}/progress`);
  };

  let authoringOrganization;
  if (program.authoringOrganizations?.length === 1 && program.authoringOrganizations[0].logoImageUrl) {
    authoringOrganization = {
      src: program.authoringOrganizations[0].logoImageUrl,
      alt: program.authoringOrganizations[0].key,
    };
  }

  return (
    <Card
      className="progress-listing-card"
      isClickable
      onClick={handleCardClick}
    >
      <Card.ImageCap
        src={program.cardImageUrl || cardFallbackImg}
        fallbackSrc={cardFallbackImg}
        logoSrc={authoringOrganization?.src}
        logoAlt={authoringOrganization?.alt}
        data-testid="program-banner-image"
        className="banner-image"
      />
      <Card.Header
        title={(
          <Truncate lines={2} trimWhitespace>
            {program.title}
          </Truncate>
        )}
        subtitle={program.authoringOrganizations?.length > 0 && (
          <Truncate lines={2} trimWhitespace>
            {program.authoringOrganizations.map(org => org.key).join(', ')}
          </Truncate>
        )}
      />
      <Card.Section>
        <div className="d-flex align-items-center">
          <img
            src={getProgramIcon(program.type)}
            alt="Program Type Logo"
            className="program-type-icon mr-2"
            style={{ height: 17, width: 'auto' }}
          />
          {program.type}
        </div>
      </Card.Section>
      <Card.Section>
        <ProgressCategoryBubbles
          inProgress={program.progress.inProgress}
          notStarted={program.progress.notStarted}
          completed={program.progress.completed}
        />
      </Card.Section>
    </Card>
  );
};

ProgramListingCard.propTypes = {
  program: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    cardImageUrl: PropTypes.string,
    progress: PropTypes.shape(
      {
        inProgress: PropTypes.number.isRequired,
        completed: PropTypes.number.isRequired,
        notStarted: PropTypes.number.isRequired,
      },
    ),
    authoringOrganizations: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      logoImageUrl: PropTypes.string.isRequired,
    })),
  }).isRequired,
};

export default ProgramListingCard;
