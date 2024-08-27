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
    fetch.mockResponseOnce(JSON.stringify(mockTranscriptData));
    convertToWebVtt.mockReturnValue(mockWebVttData);
    createWebVttFile.mockReturnValue(mockWebVttFileUrl);

    const result = await fetchAndAddTranscripts(mockTranscriptUrls);

    expect(fetch).toHaveBeenCalledWith(mockTranscriptUrls.en);
    expect(convertToWebVtt).toHaveBeenCalledWith(mockTranscriptData);
    expect(createWebVttFile).toHaveBeenCalledWith(mockWebVttData);

    expect(result).toEqual({
      en: mockWebVttFileUrl,
    });
  });

  it('should log an error if the transcript fetch, JSON parsing, or file creation fails', async () => {
    const mockTranscriptUrls = {
      en: 'https://example.com/en-transcript.json',
    };
    const error = new Error('failed to fetch!');
    fetch.mockRejectOnce(error);

    const result = await fetchAndAddTranscripts(mockTranscriptUrls);

    expect(fetch).toHaveBeenCalledWith(mockTranscriptUrls.en);
    expect(logError).toHaveBeenCalledWith(`Error fetching or processing transcript for en: ${error}`);

    expect(result).toEqual({});
  });

  it('should log an error if there is an error during Promise.all', async () => {
    const mockTranscriptUrls = {
      en: 'https://example.com/en-transcript.json',
    };
    const mockTranscriptData = {
      items: ['example'],
    };
    fetch.mockResponseOnce(JSON.stringify(mockTranscriptData));
    const error = new Error('File creation error');
    createWebVttFile.mockImplementation(() => {
      throw error;
    });

    const result = await fetchAndAddTranscripts(mockTranscriptUrls);

    expect(fetch).toHaveBeenCalledWith(mockTranscriptUrls.en);
    expect(logError).toHaveBeenCalledWith(
      `Error fetching or processing transcript for en: ${error}`,
    );

    expect(result).toEqual({});
  });
});
