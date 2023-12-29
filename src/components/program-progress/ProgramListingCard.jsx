import {
  breakpoints, Card, Truncate,
} from '@openedx/paragon';
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { useHistory } from 'react-router-dom';

import { AppContext } from '@edx/frontend-platform/react';

import { getProgramIcon } from '../course/data/utils';
import { ProgressCategoryBubbles } from '../progress-category-bubbles';

const ProgramListingCard = ({ program }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const history = useHistory();

  const handleCardClick = () => {
    history.push(`/${enterpriseConfig.slug}/program/${program.uuid}/progress`);
  };

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const getBannerImageURL = () => {
    let imageURL = '';
    if (windowWidth >= breakpoints.large.minWidth) {
      imageURL = program.bannerImage.large.url;
    } else if (windowWidth >= breakpoints.medium.minWidth) {
      imageURL = program.bannerImage.medium.url;
    } else if (windowWidth >= breakpoints.small.minWidth) {
      imageURL = program.bannerImage.small.url;
    } else {
      imageURL = program.bannerImage.xSmall.url;
    }
    return imageURL;
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
        src={getBannerImageURL() || cardFallbackImg}
        fallbackSrc={cardFallbackImg}
        logoSrc={authoringOrganization?.src}
        logoAlt={authoringOrganization?.alt}
        data-testid="program-banner-image"
        className="banner-image"
      />

      <Card.Header
        title={(
          <Truncate maxLine={2}>{program.title}</Truncate>
        )}
        subtitle={program.authoringOrganizations?.length > 0 ? (
          <Truncate maxLine={2}>
            {program.authoringOrganizations.map(org => org.key).join(', ')}
          </Truncate>
        ) : undefined}
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
    progress: PropTypes.shape(
      {
        inProgress: PropTypes.number.isRequired,
        completed: PropTypes.number.isRequired,
        notStarted: PropTypes.number.isRequired,
      },
    ),
    bannerImage: PropTypes.shape(
      {
        large: PropTypes.shape({
          url: PropTypes.string.isRequired,
          height: PropTypes.number.isRequired,
          width: PropTypes.number.isRequired,
        }),
        medium: PropTypes.shape({
          url: PropTypes.string.isRequired,
          height: PropTypes.number.isRequired,
          width: PropTypes.number.isRequired,
        }),
        small: PropTypes.shape({
          url: PropTypes.string.isRequired,
          height: PropTypes.number.isRequired,
          width: PropTypes.number.isRequired,
        }),
        xSmall: PropTypes.shape({
          url: PropTypes.string.isRequired,
          height: PropTypes.number.isRequired,
          width: PropTypes.number.isRequired,
        }),
      },
    ),
    authoringOrganizations: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      logoImageUrl: PropTypes.string.isRequired,
    })),
  }).isRequired,
};

export default ProgramListingCard;
