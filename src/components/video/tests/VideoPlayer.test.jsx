import React from 'react';
import { waitFor } from '@testing-library/react';
import VideoPlayer from '../VideoPlayer';
import { renderWithRouter } from '../../../utils/tests';

const hlsUrl = 'https://test-domain.com/test-prefix/id.m3u8';
const ytUrl = 'https://www.youtube.com/watch?v=oHg5SJYRHA0';
const mp3Url = 'https://example.com/audio.mp3';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getPrimaryLanguageSubtag: () => 'en',
}));

describe('Video Player component', () => {
  it('Renders Video Player components correctly for HLS videos.', async () => {
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

  it('Renders Video Player components correctly for mp3 audio.', async () => {
    const { container } = renderWithRouter(<VideoPlayer videoURL={mp3Url} />);
    expect(container.querySelector('.video-player-container')).toBeTruthy();
    await waitFor(() => expect(container.querySelector('.video-js-wrapper')).toBeTruthy());
    expect(container.querySelector('.vjs-big-play-centered')).toBeTruthy();
    expect(container.querySelector('video-js')).toBeTruthy();
  });

  it('Renders Video Player components correctly with transcripts.', async () => {
    const customOptions = {
      showTranscripts: true,
      transcriptUrls: { english: 'https://example.com/transcript-en.txt' },
    };
    const { container } = renderWithRouter(<VideoPlayer videoURL={ytUrl} customOptions={customOptions} />);
    expect(container.querySelector('.video-player-container-with-transcript')).toBeTruthy();
    await waitFor(() => expect(container.querySelector('.video-js-wrapper')).toBeTruthy());
    expect(container.querySelector('.vjs-big-play-centered')).toBeTruthy();
    expect(container.querySelector('video-js')).toBeTruthy();
    expect(container.querySelector('#vjs-transcribe')).toBeTruthy();
  });
});
