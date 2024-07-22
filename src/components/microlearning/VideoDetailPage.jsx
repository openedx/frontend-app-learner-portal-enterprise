import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Container, Breadcrumb, Row, MediaQuery, breakpoints, Badge, Skeleton,
} from '@openedx/paragon';
import loadable from '@loadable/component';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useVideoDetails, useEnterpriseCustomer } from '../app/data';
import { Sidebar } from '../layout';
import './styles/VideoDetailPage.scss';
import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';
import NotFoundPage from '../NotFoundPage';

const VideoPlayer = loadable(() => import(/* webpackChunkName: "videojs" */ '../video/VideoPlayer'), {
  fallback: (
    <DelayedFallbackContainer>
      <Skeleton height={200} />
    </DelayedFallbackContainer>
  ),
});

const VideoDetailPage = () => {
  const location = useLocation();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: videoData } = useVideoDetails();

  const intl = useIntl();

  const customOptions = {
    showPlaybackMenu: true,
    showTranscripts: true,
    transcriptUrls: videoData?.transcriptUrls,
  };

  useEffect(() => {
    if (videoData?.videoURL) {
      VideoPlayer.preload();
    }
  }, [videoData?.videoURL]);

  const routeLinks = [
    {
      label: 'Explore Videos',
      to: `/${enterpriseCustomer.slug}/videos`,
    },
  ];
  if (location.state?.parentRoute) {
    routeLinks.push(location.state.parentRoute);
  }

  // Comprehensive error handling will be implemented upon receiving specific error use cases from the UX team
  // and corresponding Figma designs.
  if (!videoData) {
    return (
      <NotFoundPage
        errorHeading={intl.formatMessage({
          id: 'video.detail.page.video.not.found.page.message',
          defaultMessage: 'video not found',
          description: 'Error message for the video not found page.',
        })}
      />
    );
  }

  return (
    <Container size="lg" className="pt-3 video-detail-page-wrapper">
      <div className="small">
        <Breadcrumb
          links={routeLinks}
          activeLabel={videoData?.courseTitle}
          linkAs={Link}
        />
      </div>
      <Row>
        <article className="col-12 col-lg-9">
          <div className="d-flex flex-column align-items-start flex-grow-1 video-container">
            <div className="d-flex flex-row align-items-center justify-content-between">
              <h2 data-testid="video-title" className="mb-0">
                {videoData?.courseTitle}
              </h2>
              <span className="small ml-2 mt-2">
                {videoData?.videoDuration && `(${videoData?.videoDuration} minutes)`}
              </span>
            </div>
            <p className="small align-self-stretch text-justify mb-2">
              {videoData?.videoSummary}
            </p>
            { videoData?.videoSkills?.length > 0 && (
              <div className="d-flex flex-row align-items-center">
                <h4>
                  <FormattedMessage
                    id="videoDetailPage.skills.label"
                    defaultMessage="Skills:"
                    description="Label for skills on video detail page"
                  />
                </h4>
                <div className="ml-2 mb-2.5">
                  {(
                    videoData?.videoSkills.map((skill) => (
                      <Badge
                        key={skill.skill_id}
                        className="p-2 mr-1 mt-2 mr-2 font-weight-normal"
                        variant="light"
                      >
                        {skill.name}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="video-player-wrapper position-relative mw-100 overflow-hidden my-4 mt-2">
            <VideoPlayer videoURL={videoData?.videoUrl} customOptions={customOptions} />
          </div>
        </article>
        <MediaQuery minWidth={breakpoints.large.minWidth}>
          {matches => matches && (
            <Sidebar>
              {/* Course Sidebar will be inserted here */}
            </Sidebar>
          )}
        </MediaQuery>
      </Row>
    </Container>
  );
};

export default VideoDetailPage;
