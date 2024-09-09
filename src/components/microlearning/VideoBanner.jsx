import {
  Card, Button,
} from '@openedx/paragon';
import './styles/VideoDetailPage.scss';
import { Link } from 'react-router-dom';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import BetaBadge from './BetaBadge';
import { useEnterpriseCustomer } from '../app/data';

const VideoBanner = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { authenticatedUser: { userId } } = useContext(AppContext);
  const sendPushEvent = () => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.video_banner.explore_videos_clicked',
      {
        userId,
      },
    );
  };
  return (
    <div data-testid="video-banner" className="d-flex justify-content-center">
      <Card orientation="horizontal" className="video-banner-class bg-light-300">
        <Card.Section className="col-9 text-primary-500">
          <span className="d-flex justify-content-center align-items-end">
            <h3 className="text-brand-500 pr-1 m-0">
              <FormattedMessage
                id="enterprise.microlearning.video.banner.new"
                defaultMessage="New!"
                description="New badge for the video banner on the video page."
              />
            </h3>
            <h3 className="p-0 m-0">
              <FormattedMessage
                id="enterprise.microlearning.videoBanner.title"
                defaultMessage="Videos Now Available with Your Subscription"
                description="Title for the video banner on the video page."
              />
            </h3>
            <BetaBadge />
          </span>
          <p className="d-flex justify-content-center">
            <FormattedMessage
              id="enterprise.microlearning.videoBanner.description"
              defaultMessage="Transform your potential into success."
              description="Description for the video banner on the video page."
            />
          </p>
        </Card.Section>
        <Card.Footer className="col-3 justify-content-end">
          <Button
            as={Link}
            to="#videos-section"
            variant="outline-primary"
            onClick={sendPushEvent}
          >
            <FormattedMessage
              id="enterprise.microlearning.videoBanner.exploreVideos"
              defaultMessage="Explore Videos"
              description="Explore Videos button text for the video banner on the video page."
            />
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default VideoBanner;
