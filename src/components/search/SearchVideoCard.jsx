import { useMemo } from 'react';
import PropTypes from 'prop-types';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import { Link } from 'react-router-dom';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {
  Card, Chip, Icon, Truncate,
} from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { PlayCircleOutline } from '@openedx/paragon/icons';
import { useEnterpriseCustomer } from '../app/data';

dayjs.extend(duration);

const SearchVideoCard = ({
  key, hit, isLoading, parentRoute, ...rest
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const video = useMemo(
    () => {
      if (!hit) {
        return {};
      }
      return camelCaseObject(hit);
    },
    [hit],
  );
  const linkToVideo = useMemo(
    () => {
      if (!Object.keys(video).length) {
        return '#';
      }
      return `/${enterpriseCustomer.slug}/videos/${video?.aggregationKey}/`;
    },
    [video, enterpriseCustomer.slug],
  );
  const getFormattedDuration = (durationInSeconds) => {
    const time = dayjs.duration({ seconds: durationInSeconds });
    const minutes = Math.floor(time.asMinutes());
    const seconds = (durationInSeconds % 60).toFixed(0).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  return (
    <Card
      data-testid="search-video-card"
      className="d-inline-flex"
      isLoading={isLoading}
      isClickable
      as={Link}
      to={linkToVideo}
      state={{ parentRoute }}
      {...rest}
    >
      <Card.ImageCap
        src={video?.imageUrl || cardFallbackImg}
        fallbackSrc={cardFallbackImg}
        srcAlt=""
        logoSrc={video.logoImageUrls?.[0] || cardFallbackImg}
        logoAlt={video?.title || ''}
      />
      <Card.Header
        title={(video?.title && <Truncate lines={3}>{video.title}</Truncate>)}
        subtitle={video?.org && (
          <Truncate lines={2}>
            {video.org}
          </Truncate>
        )}
      />
      <Card.Section />
      <Card.Footer className="justify-content-between">
        <div className="d-flex flex-column">
          {video?.duration && <Chip size="lg" className="mb-2 px-0.5">{getFormattedDuration(video.duration)}</Chip>}
          <span className="text-muted x-small mx-1">
            <FormattedMessage
              id="enterprise.search.videoCard.generalLength.video"
              defaultMessage="Video"
              description="Label for general length video on video card"
            />
          </span>
        </div>
        <Icon src={PlayCircleOutline} style={{ height: '48px', width: '48px' }} />
      </Card.Footer>
    </Card>
  );
};

const SkeletonVideoCard = (props) => (
  <SearchVideoCard {...props} isLoading />
);

SearchVideoCard.propTypes = {
  hit: PropTypes.shape({
    key: PropTypes.string,
    title: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  key: PropTypes.string,
  parentRoute: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }),
};

SearchVideoCard.defaultProps = {
  hit: undefined,
  isLoading: false,
  key: undefined,
  parentRoute: undefined,
};

SearchVideoCard.Skeleton = SkeletonVideoCard;

export default SearchVideoCard;
