import { logError } from '@edx/frontend-platform/logging';
import { fetchAndAddTranscripts } from '../service';
import { convertToWebVtt, createWebVttFile } from '../utils';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../utils', () => ({
  convertToWebVtt: jest.fn(),
  createWebVttFile: jest.fn(),
}));

describe('fetchAndAddTranscripts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch, convert, and add transcripts successfully', async () => {
    const mockTranscriptUrls = {
      en: 'https://example.com/en-transcript.json',
    };

    const mockTranscriptData = {
      items: ['example'],
    };

    const mockWebVttData = 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:05.000\nExample subtitle';
    const mockWebVttFileUrl = 'https://example.com/en-transcript.vtt';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTranscriptData),
    });

    convertToWebVtt.mockReturnValue(mockWebVttData);
    createWebVttFile.mockReturnValue(mockWebVttFileUrl);

    const player = {
      addRemoteTextTrack: jest.fn(),
      vjstranscribe: jest.fn(),
    };

    await fetchAndAddTranscripts(mockTranscriptUrls, player);

    expect(global.fetch).toHaveBeenCalledWith(mockTranscriptUrls.en);
    expect(convertToWebVtt).toHaveBeenCalledWith(mockTranscriptData);
    expect(createWebVttFile).toHaveBeenCalledWith(mockWebVttData);
    expect(player.addRemoteTextTrack).toHaveBeenCalledWith(
      {
        kind: 'subtitles',
        src: mockWebVttFileUrl,
        srclang: 'en',
        label: 'en',
      },
      false,
    );
    expect(player.vjstranscribe).toHaveBeenCalledWith({
      urls: [mockWebVttFileUrl],
    });
  });

  it('should log an error if the transcript fetch fails', async () => {
    const mockTranscriptUrls = {
      en: 'https://example.com/en-transcript.json',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    });

    const player = {
      addRemoteTextTrack: jest.fn(),
      vjstranscribe: jest.fn(),
    };

    await fetchAndAddTranscripts(mockTranscriptUrls, player);

    expect(global.fetch).toHaveBeenCalledWith(mockTranscriptUrls.en);
    expect(logError).toHaveBeenCalledWith('Failed to fetch transcript for en');
  });

  it('should log an error if JSON parsing or file creation fails', async () => {
    const mockTranscriptUrls = {
      en: 'https://example.com/en-transcript.json',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('Parsing error')),
    });

    const player = {
      addRemoteTextTrack: jest.fn(),
      vjstranscribe: jest.fn(),
    };

    await fetchAndAddTranscripts(mockTranscriptUrls, player);

    expect(global.fetch).toHaveBeenCalledWith(mockTranscriptUrls.en);
    expect(logError).toHaveBeenCalledWith(
      'Error fetching or processing transcript for en:',
      expect.any(Error),
    );
  });

  it('should log an error if there is an error during Promise.all', async () => {
    const mockTranscriptUrls = {
      en: 'https://example.com/en-transcript.json',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    const player = {
      addRemoteTextTrack: jest.fn(),
      vjstranscribe: jest.fn(),
    };

    createWebVttFile.mockImplementation(() => {
      throw new Error('File creation error');
    });

    await fetchAndAddTranscripts(mockTranscriptUrls, player);

    expect(global.fetch).toHaveBeenCalledWith(mockTranscriptUrls.en);
    expect(logError).toHaveBeenCalledWith(
      'Error fetching or processing transcript for en:',
      expect.any(Error),
    );
  });
});
