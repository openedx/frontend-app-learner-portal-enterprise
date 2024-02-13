import React, { lazy, Suspense, useMemo } from 'react';
import PropTypes from 'prop-types';
import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';

const VideoJS = lazy(() => import(
  /* webpackChunkName: "videojs" */
  './VideoJS'
));
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
      <Suspense
        fallback={
          <DelayedFallbackContainer className="py-5 d-flex justify-content-center align-items-center" />
        }
      >
        <VideoJS options={videoDetails} onReady={onReady} />
      </Suspense>
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
