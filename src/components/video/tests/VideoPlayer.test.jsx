import React from 'react';
import { waitFor } from '@testing-library/react';
import { VideoPlayer } from '..';
import { renderWithRouter } from '../../../utils/tests';

const hlsUrl = 'https://test-domain.com/test-prefix/id.m3u8';
const ytUrl = 'https://www.youtube.com/watch?v=oHg5SJYRHA0';

describe('Video Player component', () => {
  it('Renders Video Player components correctly.', async () => {
    const { container } = renderWithRouter(<VideoPlayer videoURL={hlsUrl} />);
    expect(container.querySelector('.video-player-container')).toBeTruthy();
    await waitFor(() => expect(container.querySelector('.video-js-wrapper')).toBeTruthy());
    expect(container.querySelector('.vjs-big-play-centered')).toBeTruthy();
    expect(container.querySelector('video-js')).toBeTruthy();
  });

  it('Renders Video Player components correctly for Youtube videos.', () => {
    const { container } = renderWithRouter(<VideoPlayer videoURL={ytUrl} />);
    expect(container.querySelector('.video-player-container')).toBeTruthy();
    expect(container.querySelector('.video-js-wrapper')).toBeTruthy();
    expect(container.querySelector('.vjs-big-play-centered')).toBeTruthy();
    expect(container.querySelector('video-js')).toBeTruthy();
  });
});
