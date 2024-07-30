/* eslint-disable max-len */
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Container, Breadcrumb, Row, Badge, Skeleton,
  Hyperlink,
  Icon,
  Button,
} from '@openedx/paragon';
import loadable from '@loadable/component';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Person, Speed, Timelapse,
} from '@openedx/paragon/icons';
import {
  useVideoDetails, useEnterpriseCustomer, useVideoCourseMetadata,
} from '../app/data';
import './styles/VideoDetailPage.scss';
import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';
import NotFoundPage from '../NotFoundPage';
import { getCoursePrice, useCoursePacingType } from '../course/data';
import VideoCourseReview from './VideoCourseReview';
import { hasTruthyValue, isDefinedAndNotNull } from '../../utils/common';
import { getLevelType } from './data/utils';

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
  const { data: courseMetadata } = useVideoCourseMetadata(videoData?.courseKey);
  const [pacingType, pacingTypeContent] = useCoursePacingType(courseMetadata?.activeCourseRun);
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
  const levelType = courseMetadata?.activeCourseRun?.levelType ? getLevelType(intl, courseMetadata.activeCourseRun.levelType) : null;
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
              <span className="small ml-2 mt-2 text-nowrap">
                {videoData?.videoDuration && `(${videoData?.videoDuration} minutes)`}
              </span>
            </div>
            <p className="small align-self-stretch p-0 mb-0">
              {videoData?.videoSummary}
            </p>
            {videoData?.videoSkills?.length > 0 && (
              <div className="d-flex flex-row align-items-center">
                <h4 className="mb-0">
                  <FormattedMessage
                    id="videoDetailPage.skills.label"
                    defaultMessage="Skills:"
                    description="Label for skills on video detail page"
                  />
                </h4>
                <div className="ml-2 mb-1">
                  {(
                    videoData.videoSkills.map((skill) => (
                      <Badge
                        key={skill.skill_id}
                        className="p-2 mr-3 font-weight-normal"
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
          { videoData?.videoUrl && (
            <div className="video-player-wrapper position-relative mw-100 overflow-hidden my-4 mt-2">
              <VideoPlayer videoURL={videoData?.videoUrl} customOptions={customOptions} />
            </div>
          )}
        </article>
        {isDefinedAndNotNull(courseMetadata.activeCourseRun) && (
          <article className="col-12 col-lg-3 pr-0">
            <div className="d-flex flex-column align-items-start">
              <h3 className="m-0">
                <FormattedMessage
                  id="enterprise.videoDetail.courseSidebar.explore.course"
                  defaultMessage="Explore this course"
                  description="Heading for the section that lists the course details."
                />
              </h3>
              <div className="d-flex align-items-center mt-2.5">
                <img
                  src={videoData?.institutionLogo}
                  alt="institution logo"
                  className="mr-2 logo-cutom-style rounded-sm p-1"
                />
                <div className="x-small">
                  <Hyperlink
                    destination={`/${enterpriseCustomer.slug}/course/${courseMetadata?.key}`}
                    target="_blank"
                  >
                    {courseMetadata?.title}
                  </Hyperlink>
                </div>
              </div>
              <VideoCourseReview courseKey={courseMetadata.key} />
              <div className="d-flex flex-column mt-2.5">
                <div className="d-flex flex-row align-items-center">
                  <strong className="mr-1">
                    <FormattedMessage
                      id="enterprise.courseAbout.courseSidebar.price.original"
                      defaultMessage="Original price:"
                      description="Label for the original price of the course."
                    />
                  </strong>
                  <s>${getCoursePrice(courseMetadata)} USD</s>
                  <h4 className="text-danger ml-2 m-0">
                    <FormattedMessage
                      id="enterprise.courseAbout.courseSidebar.price.free"
                      defaultMessage="FREE"
                      description="Label for the price of the course. FREE"
                    />
                  </h4>
                </div>
                <span className="text-muted small">
                  <FormattedMessage
                    id="enterprise.courseAbout.courseSidebar.price.coveredBy.your.organization"
                    defaultMessage="Covered by your organization"
                    description="Label for the price of the course. Covered by your organization"
                  />
                </span>
              </div>
            </div>
            <div className="my-4.5">
              {hasTruthyValue(courseMetadata.activeCourseRun.weeksToComplete) && (
                <div className="d-flex flex-row align-items-center mb-3">
                  <Icon className="mr-2" size="lg" src={Timelapse} style={{ height: '40px', width: '40px' }} />
                  <div className="d-flex flex-column p-0 m-0">
                    <h5 className="m-0 x-small">{courseMetadata.activeCourseRun.weeksToComplete} weeks</h5>
                    {hasTruthyValue([courseMetadata.activeCourseRun.minEffort, courseMetadata.activeCourseRun.maxEffort]) && (
                      <span className="text-muted x-small">
                        {`${courseMetadata.activeCourseRun.minEffort}-${courseMetadata.activeCourseRun.maxEffort} hours per week`}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="d-flex flex-row align-items-center mb-3">
                <Icon className="mr-2" size="lg" src={Person} style={{ height: '40px', width: '40px' }} />
                <div className="d-flex flex-column p-0 m-0">
                  <h5 className="m-0 x-small">{pacingType}</h5>
                  <span className="text-muted x-small">{pacingTypeContent}</span>
                </div>
              </div>
              {courseMetadata.activeCourseRun.levelType && (
                <div className="d-flex flex-row align-items-center mb-3">
                  <Icon className="mr-2" size="lg" src={Speed} style={{ height: '40px', width: '40px' }} />
                  <div className="d-flex flex-column p-0 m-0">
                    <h5 className="m-0 x-small">{levelType.level}</h5>
                    <span className="text-muted x-small">{levelType.description}</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h3>
                {intl.formatMessage({
                  id: 'enterprise.videoDetail.courseSidebar.outcomeHeading',
                  defaultMessage: "What you'll learn",
                  description: 'Heading for the section that lists what you will learn in the course.',
                })}
              </h3>
              <div
                className="preview-enroll-expand-body x-small overflow-hidden position-relative"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: courseMetadata?.outcome }}
              />
              <div className="x-small">
                <FormattedMessage
                  id="enterprise.videoDetailPage.sidebar.view.moreOn.coursePage"
                  defaultMessage="<a>View more on course page</a>"
                  description="Data sharing consent label for the executive education course enrollment page. And here GetSmarter is brand name"
                  values={{
                    // eslint-disable-next-line react/no-unstable-nested-components
                    a: (chunks) => (
                      <Hyperlink
                        destination={`/${enterpriseCustomer.slug}/course/${courseMetadata?.key}`}
                        target="_blank"
                      >
                        {chunks}
                      </Hyperlink>
                    ),
                  }}
                />
              </div>
              <div>
                <Button
                  variant="primary"
                  as={Hyperlink}
                  destination={`/${enterpriseCustomer.slug}/course/${courseMetadata?.key}`}
                  target="_blank"
                  className="mt-4.5 w-100"
                >
                  <FormattedMessage
                    id="enterprise.videoDetailPage.sidebar.view.course.details"
                    defaultMessage="View course details"
                    description="Button to view course details"
                  />
                </Button>
              </div>
            </div>
          </article>
        )}
      </Row>
    </Container>
  );
};

export default VideoDetailPage;
