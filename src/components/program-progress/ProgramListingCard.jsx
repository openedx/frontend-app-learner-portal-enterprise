import {
  breakpoints, Bubble, Card, Stack,
} from '@edx/paragon';
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import { AppContext } from '@edx/frontend-platform/react';

import Truncate from 'react-truncate';
import { getProgramIcon } from '../course/data/utils';

function ProgramListingCard({ program }) {
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

  let authoringOrganization;
  if (program.authoringOrganizations?.length === 1 && program.authoringOrganizations[0].logoImageUrl) {
    authoringOrganization = {
      src: program.authoringOrganizations[0].logoImageUrl,
      alt: program.authoringOrganizations[0].key,
    };
  }

  return (
    <Card
      className="mb-4 program-listing-card mr-5"
      isClickable
      onClick={handleCardClick}
    >
      <Card.ImageCap
        src={getBannerImageURL()}
        logoSrc={authoringOrganization?.src}
        logoAlt={authoringOrganization?.alt}
        data-testid="program-banner-image"
        className="program-banner-image"
      />

      <Card.Header
        title={(
          <Truncate lines={2} trimWhitespace>
            {program.title}
          </Truncate>
        )}
        subtitle={(
          <div>
            <div>
              {program.authoringOrganizations?.length > 0
               && program.authoringOrganizations.map(org => org.key).join(' ')}
            </div>

            <div className="font-weight-light d-flex justify-content-between">
              <div className="program-type">
                <img
                  src={getProgramIcon(program.type)}
                  alt="Program Type Logo"
                  className="program-type-icon mr-2"
                />
                {program.type}
              </div>
            </div>
          </div>
        )}
      />

      <Card.Section className="py-3">
        <Stack direction="horizontal" gap={2}>
          <Bubble className="remaining-courses">
            {program.progress.notStarted}
          </Bubble>
          <div>Remaining</div>

          <Bubble className="in-progress-courses">
            {program.progress.inProgress}
          </Bubble>
          <div>In progress</div>

          <Bubble className="completed-courses">
            {program.progress.completed}
          </Bubble>
          <div>Completed</div>
        </Stack>
      </Card.Section>
    </Card>
  );
}

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
