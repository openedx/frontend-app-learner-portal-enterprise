import React from 'react';
import { VideoJS } from '..';
import { renderWithRouter } from '../../../utils/tests';

const hlsUrl = 'https://test-domain.com/test-prefix/id.m3u8';
const ytUrl = 'https://www.youtube.com/watch?v=oHg5SJYRHA0';

const HLSVideoOptions = {
  autoplay: true,
  responsive: true,
  fluid: true,
  controls: true,
  sources: [{ src: hlsUrl, type: 'application/x-mpegURL' }],
};

const YoutubeVideoOptions = {
  autoplay: true,
  responsive: true,
  fluid: true,
  controls: false,
  techOrder: ['youtube'],
  youtube: { ytControls: 2, enablePrivacyEnhancedMode: true },
  sources: [{ src: ytUrl, type: 'video/youtube' }],
};

describe('Videon JS component', () => {
  it('Renders VideoJS components correctly.', () => {
    const { container } = renderWithRouter(<VideoJS options={HLSVideoOptions} />);
    expect(container.querySelector('.video-js-wrapper')).toBeTruthy();
    expect(container.querySelector('.vjs-big-play-centered')).toBeTruthy();
    expect(container.querySelector('video-js')).toBeTruthy();
  });

  it('Renders VideoJS components correctly for Youtube videos.', () => {
    const { container } = renderWithRouter(<VideoJS options={YoutubeVideoOptions} />);
    expect(container.querySelector('.video-js-wrapper')).toBeTruthy();
    expect(container.querySelector('.vjs-big-play-centered')).toBeTruthy();
    expect(container.querySelector('video-js')).toBeTruthy();
  });
});
