import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';

import { PlayCircleFilled } from '@edx/paragon/icons';
import { useToggle, Image, Skeleton } from '@edx/paragon';
import DelayedFallbackContainer from '../../DelayedFallback/DelayedFallbackContainer';

const VideoPlayer = loadable(() => import(/* webpackChunkName: "videojs" */ '../../video/VideoPlayer'), {
  fallback: (
    <DelayedFallbackContainer>
      <Skeleton height={200} />
    </DelayedFallbackContainer>
  ),
});

const CoursePreview = ({ previewImage, previewVideoURL }) => {
  const [isVideoPlaying, playVideo] = useToggle(false);

  useEffect(() => {
    if (previewVideoURL) {
      VideoPlayer.preload();
    }
  }, [previewVideoURL]);

  return (
    <div className="course-preview-wrapper">
      {previewVideoURL ? (
        <div className="video-component">
          {isVideoPlaying ? (
            <div className="video-wrapper">
              <VideoPlayer videoURL={previewVideoURL} />
            </div>
          ) : (
            <button
              className="video-trigger mw-100"
              onClick={() => playVideo(true)}
              type="button"
            >
              <Image src={previewImage} className="video-thumb" alt="" />
              <div className="video-trigger-cta btn btn-inverse-primary">
                <PlayCircleFilled className="mr-1" />
                Play Video
              </div>
            </button>
          )}
        </div>
      ) : (
        <Image src={previewImage} alt="course preview" fluid />
      )}
    </div>
  );
};

CoursePreview.propTypes = {
  previewImage: PropTypes.string.isRequired,
  previewVideoURL: PropTypes.string,
};

CoursePreview.defaultProps = {
  previewVideoURL: null,
};

export default CoursePreview;
