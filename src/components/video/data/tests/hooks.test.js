import { renderHook } from '@testing-library/react';
import { logError } from '@edx/frontend-platform/logging';
import { useTranscripts } from '../hooks';
import { fetchAndAddTranscripts } from '../service';

// Mocking dependencies
jest.mock('../service', () => ({
  fetchAndAddTranscripts: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('useTranscripts', () => {
  const customOptions = {
    showTranscripts: true,
    transcriptUrls: {
      en: 'https://example.com/transcript-en.txt',
    },
  };
  const mockPlayer = {};

  it('should set isLoading to true initially if showTranscripts is true', () => {
    const { result } = renderHook(() => useTranscripts({ player: mockPlayer, customOptions }));
    expect(result.current.isLoading).toBe(true);
  });

  it('should fetch and set textTracks and transcriptUrl correctly', async () => {
    const textTracks = { en: 'https://example.com/transcript-en.txt' };
    fetchAndAddTranscripts.mockResolvedValueOnce(textTracks);

    const { result, waitForNextUpdate } = renderHook(() => useTranscripts({
      player: mockPlayer,
      customOptions,
      siteLanguage: 'en',
    }));

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.textTracks).toEqual(textTracks);
    expect(result.current.transcriptUrl).toBe(textTracks.en);
  });

  it('should log error and set isLoading to false if fetching transcripts fails', async () => {
    const errorMessage = 'Error fetching transcripts';
    fetchAndAddTranscripts.mockRejectedValueOnce(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHook(() => useTranscripts({ player: mockPlayer, customOptions }));

    await waitForNextUpdate();

    expect(logError).toHaveBeenCalledWith(`Error fetching transcripts for player: Error: ${errorMessage}`);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.textTracks).toEqual({});
    expect(result.current.transcriptUrl).toBeNull();
  });

  it('should not fetch transcripts if showTranscripts is false', async () => {
    const customOptionsWithoutTranscripts = {
      showTranscripts: false,
      transcriptUrls: undefined,
    };

    const { result } = renderHook(() => useTranscripts({
      player: mockPlayer,
      customOptions: customOptionsWithoutTranscripts,
    }));

    expect(result.current.textTracks).toEqual({});
    expect(result.current.transcriptUrl).toBeNull();
  });
});
