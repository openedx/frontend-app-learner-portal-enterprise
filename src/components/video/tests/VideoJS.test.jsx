import React from 'react';
import { waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../../utils/tests';
import VideoJS from '../VideoJS';
import { useTranscripts } from '../data';

// Mocking the 'videojs-vjstranscribe' and 'useTranscripts' hook
jest.mock('videojs-vjstranscribe');
jest.mock('../data', () => ({
  useTranscripts: jest.fn(),
  usePlayerOptions: jest.fn(),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
}));

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

describe('VideoJS', () => {
  beforeEach(() => {
    useTranscripts.mockReturnValue({
      isLoading: false,
      textTracks: {},
      transcriptUrl: null,
    });
  });

  it('Renders VideoJS components correctly for HLS videos.', () => {
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

  it('Renders VideoJS components correctly with transcripts.', async () => {
    const customOptions = {
      showTranscripts: true,
      transcriptUrls: {
        en: 'https://example.com/transcript-en.txt',
      },
    };

    useTranscripts.mockReturnValue({
      isLoading: false,
      textTracks: {
        en: 'https://example.com/transcript-en.txt',
      },
      transcriptUrl: 'https://example.com/transcript-en.txt',
    });

    const { container } = renderWithRouter(<VideoJS options={HLSVideoOptions} customOptions={customOptions} />);

    await waitFor(() => {
      expect(container.querySelector('.video-js-wrapper')).toBeTruthy();
      expect(container.querySelector('.vjs-big-play-centered')).toBeTruthy();
      expect(container.querySelector('video-js')).toBeTruthy();
      expect(container.querySelector('#vjs-transcribe')).toBeTruthy();
    });
  });

  it('Does not initialize VideoJS player while transcripts are loading.', async () => {
    const customOptions = {
      showTranscripts: true,
      transcriptUrls: {
        en: 'https://example.com/transcript-en.txt',
      },
    };

    useTranscripts.mockReturnValue({
      isLoading: true,
      textTracks: {},
      transcriptUrl: null,
    });

    const { container } = renderWithRouter(<VideoJS options={HLSVideoOptions} customOptions={customOptions} />);

    await waitFor(() => {
      expect(container.querySelector('.video-js-wrapper')).toBeTruthy();
      expect(container.querySelector('.vjs-big-play-centered')).toBeFalsy();
      expect(container.querySelector('video-js')).toBeFalsy();
    });
  });
});
