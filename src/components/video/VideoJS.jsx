import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import 'videojs-youtube';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoJS = ({ options, onReady }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement('video-js');

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      // eslint-disable-next-line no-multi-assign
      const player = playerRef.current = videojs(videoElement, options, () => {
        if (onReady) {
          onReady(player);
        }
      });
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [onReady, options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className="video-js-wrapper">
      <div ref={videoRef} />
    </div>
  );
};

VideoJS.propTypes = {
  options: PropTypes.shape({
    autoplay: PropTypes.bool,
    controls: PropTypes.bool,
    responsive: PropTypes.bool,
    fluid: PropTypes.bool,
    sources: PropTypes.arrayOf(PropTypes.shape({
      src: PropTypes.string,
      type: PropTypes.string,
    })),
  }).isRequired,
  onReady: PropTypes.func,
};

VideoJS.defaultProps = {
  onReady: null,
};

export default VideoJS;
