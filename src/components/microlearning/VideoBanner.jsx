import { useEffect } from 'react';
import { Card, Button } from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import BetaBadge from './BetaBadge';
import { useEnterpriseCustomer } from '../app/data';
import './styles/VideoDetailPage.scss';

const VideoBanner = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  useEffect(() => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.video_banner.viewed',
    );
  }, [enterpriseCustomer]);

  const sendPushEvent = () => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.video_banner.explore_videos_clicked',
    );
  };
  return (
    <div data-testid="video-banner" className="d-flex justify-content-center">
      <Card orientation="horizontal" className="video-banner-class bg-light-300">
        <Card.Section className="col-9">
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
              defaultMessage="Explore videos"
              description="Button text for the Explore CTA within video banner on the video page."
            />
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default VideoBanner;
