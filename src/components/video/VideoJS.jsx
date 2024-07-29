import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { logError } from '@edx/frontend-platform/logging';

import 'videojs-youtube';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { PLAYBACK_RATES } from './data/constants';
import { fetchAndAddTranscripts } from './data/service';

window.videojs = videojs;
// eslint-disable-next-line import/no-extraneous-dependencies
require('videojs-vjstranscribe');

function useTranscripts({ player, customOptions }) {
  const shouldUseTranscripts = customOptions?.showTranscripts && customOptions?.transcriptUrls;
  const [isLoading, setIsLoading] = useState(shouldUseTranscripts);
  const [textTracks, setTextTracks] = useState([]);
  const [transcriptUrl, setTranscriptUrl] = useState(null);

  useEffect(() => {
    const fetchFn = async () => {
      setIsLoading(true);
      if (shouldUseTranscripts) {
        try {
          const result = await fetchAndAddTranscripts(customOptions.transcriptUrls, player);
          setTextTracks(result);
          // We are only catering to English transcripts for now as we don't have the option to change
          // the transcript language yet.
          if (result.en) {
            setTranscriptUrl(result.en);
          }
        } catch (error) {
          logError(`Error fetching transcripts for player: ${error}`);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchFn();
  }, [customOptions.transcriptUrls, player, shouldUseTranscripts]);

  return {
    textTracks,
    transcriptUrl,
    isLoading,
  };
}

const VideoJS = ({ options, onReady, customOptions }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const transcriptsData = useTranscripts({
    player: playerRef.current,
    customOptions,
  });

  useEffect(() => {
    if (transcriptsData.isLoading) {
      // While async transcripts data is loading, don't initialize the player
      return;
    }

    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement('video-js');

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const transformedPlayerOptions = {
        ...options,
        plugins: {
          vjstranscribe: {
            urls: transcriptsData.transcriptUrl ? [transcriptsData.transcriptUrl] : [],
          },
        },
      };

      playerRef.current = videojs(videoElement, transformedPlayerOptions, () => {
        const textTracks = Object.entries(transcriptsData.textTracks);
        textTracks.forEach(([lang, webVttFileUrl]) => {
          playerRef.current.addRemoteTextTrack({
            kind: 'subtitles',
            src: webVttFileUrl,
            srclang: lang,
            label: lang,
          }, false);
        });

        if (onReady) {
          onReady(playerRef.current);
        }
      });

      if (customOptions?.showPlaybackMenu) {
        playerRef.current.playbackRates(PLAYBACK_RATES);
      }
    } else {
      playerRef.current.autoplay(options.autoplay);
      playerRef.current.src(options.sources);
    }
  }, [onReady, options, customOptions, transcriptsData]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const cleanup = () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
    return cleanup;
  }, []);

  return (
    <>
      <div data-vjs-player className="video-js-wrapper">
        <div ref={videoRef} />
      </div>
      {customOptions?.showTranscripts && <div id="vjs-transcribe" className="transcript-container" />}
    </>
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
  customOptions: PropTypes.shape({
    showPlaybackMenu: PropTypes.bool,
    showTranscripts: PropTypes.bool,
    transcriptUrls: PropTypes.objectOf(PropTypes.string),
  }).isRequired,
};

VideoJS.defaultProps = {
  onReady: null,
};

export default VideoJS;
