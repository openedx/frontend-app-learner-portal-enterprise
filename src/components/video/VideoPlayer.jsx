import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import VideoJS from './VideoJS';

const hlsExtension = '.m3u8';
const defaultOptions = {
  autoplay: true,
  controls: true,
  responsive: true,
  fluid: true,
};

const VideoPlayer = ({ videoURL, onReady }) => {
  const videoDetails = useMemo(() => {
    const isHLSVideo = videoURL.includes(hlsExtension);
    if (!isHLSVideo) {
      return {
        ...defaultOptions,
        controls: false,
        techOrder: ['youtube'],
        youtube: { ytControls: 2, enablePrivacyEnhancedMode: true },
        sources: [{ src: videoURL, type: 'video/youtube' }],
      };
    }

    return {
      ...defaultOptions,
      controls: true,
      sources: [{ src: videoURL, type: 'application/x-mpegURL' }],
    };
  }, [videoURL]);

  return (
    <div className="video-player-container">
      <VideoJS options={videoDetails} onReady={onReady} />
    </div>
  );
};

VideoPlayer.propTypes = {
  videoURL: PropTypes.string.isRequired,
  onReady: PropTypes.func,
};

VideoPlayer.defaultProps = {
  onReady: null,
};

export default VideoPlayer;
