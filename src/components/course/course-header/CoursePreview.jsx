import React from 'react';
import PropTypes from 'prop-types';
import { PlayCircleFilled } from '@openedx/paragon/icons';
import { useToggle, Image } from '@openedx/paragon';
import { VideoPlayer } from '../../video';

const CoursePreview = ({ previewImage, previewVideoURL }) => {
  const [isVideoPlaying, playVideo] = useToggle(false);

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
