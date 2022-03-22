import { breakpoints, Card } from '@edx/paragon';
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import { AppContext } from '@edx/frontend-platform/react';

const ProgramListingCard = ({ program }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const history = useHistory();

  const handleCardClick = () => {
    history.push(`/${enterpriseConfig.slug}/program-progress/${program.uuid}`);
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

  return (
    <Card className="mb-4 program-listing-card mr-5" onClick={handleCardClick}>
      <Card.Img
        src={getBannerImageURL()}
        data-testid="program-banner-image"
      />
      {(program.authoringOrganizations?.length === 1 && program.authoringOrganizations[0].logoImage) && (
        <div className="partner-logo-wrapper shadow-sm">
          <img
            src={program.authoringOrganizations[0].logoImage}
            className="partner-logo"
            alt={program.authoringOrganizations[0].key}
          />
        </div>
      )}
      <Card.Body>
        <div className="font-weight-light d-flex justify-content-between">
          <div>
            {program.authoringOrganizations?.length > 0 && program.authoringOrganizations.map(org => org.key).join(' ')}
          </div>
          <div>
            {program.type}
          </div>
        </div>
        <h3 className="program-title">
          {program.title}
        </h3>
        <div className="program-progress mt-4">
          <div className="progress-item">
            <div className="remaining-courses">
              {program.progress.notStarted}
            </div>
            Remaining
          </div>
          <div className="progress-item">
            <div className="in-progress-courses">
              {program.progress.inProgress}
            </div>
            In progress
          </div>
          <div className="progress-item">
            <div className="completed-courses">
              {program.progress.completed}
            </div>
            Completed
          </div>
        </div>
      </Card.Body>
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
      logoImage: PropTypes.string.isRequired,
    })),
  }).isRequired,
};

export default ProgramListingCard;
