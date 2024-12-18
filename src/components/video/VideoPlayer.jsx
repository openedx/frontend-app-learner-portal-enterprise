import { useMemo } from 'react';
import PropTypes from 'prop-types';
import VideoJS from './VideoJS';

const hlsExtension = '.m3u8';
const defaultOptions = {
  autoplay: true,
  controls: true,
  responsive: true,
  fluid: true,
};

const VideoPlayer = ({ videoURL, onReady, customOptions }) => {
  const videoDetails = useMemo(() => {
    const isHLSVideo = videoURL.includes(hlsExtension);
    const isMp4Video = videoURL.toLowerCase().endsWith('.mp4');
    if (isMp4Video) {
      return {
        ...defaultOptions,
        // Disable autoplay if `showTranscripts` is enabled (video detail page); enable autoplay otherwise.
        autoplay: !customOptions?.showTranscripts,
        sources: [{ src: videoURL, type: 'video/mp4' }],
      };
    }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoURL]);

  return (
    <div className={
      customOptions.showTranscripts && customOptions.transcriptUrls
        ? 'video-player-container-with-transcript'
        : 'video-player-container'
    }
    >
      <VideoJS options={videoDetails} onReady={onReady} customOptions={customOptions} />
    </div>
  );
};

VideoPlayer.propTypes = {
  videoURL: PropTypes.string.isRequired,
  onReady: PropTypes.func,
  customOptions: PropTypes.shape({
    showPlaybackMenu: PropTypes.bool,
    showTranscripts: PropTypes.bool,
    transcriptUrls: PropTypes.objectOf(PropTypes.string),
  }),
};

VideoPlayer.defaultProps = {
  onReady: null,
  customOptions: {
    showPlaybackMenu: false,
    showTranscripts: false,
    transcriptUrls: undefined,
  },
};

export default VideoPlayer;
