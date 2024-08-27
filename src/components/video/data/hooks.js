import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { fetchAndAddTranscripts } from './service';
import { sortTextTracks } from './utils';

export function useTranscripts({ player, customOptions, siteLanguage }) {
  const shouldUseTranscripts = !!(customOptions?.showTranscripts && customOptions?.transcriptUrls);
  const [isLoading, setIsLoading] = useState(shouldUseTranscripts);
  const [textTracks, setTextTracks] = useState({});
  const [transcriptUrl, setTranscriptUrl] = useState(null);

  useEffect(() => {
    const fetchFn = async () => {
      setIsLoading(true);
      if (shouldUseTranscripts) {
        try {
          const result = await fetchAndAddTranscripts(customOptions.transcriptUrls, player);

          // Sort the text tracks to prioritize the site language at the top of the list.
          // Currently, video.js selects the top language from the list of transcripts.
          const sortedResult = sortTextTracks(result, siteLanguage);
          setTextTracks(sortedResult);

          // Default to site language, fallback to English
          const preferredTranscript = sortedResult[siteLanguage] || sortedResult.en;
          setTranscriptUrl(preferredTranscript);
        } catch (error) {
          logError(`Error fetching transcripts for player: ${error}`);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchFn();
  }, [customOptions?.transcriptUrls, player, shouldUseTranscripts, siteLanguage]);

  return {
    textTracks,
    transcriptUrl,
    isLoading,
  };
}

export function usePlayerOptions({
  transcripts,
  options,
  customOptions,
}) {
  const plugins = { ...options.plugins };
  if (customOptions?.showTranscripts && transcripts.transcriptUrl) {
    const existingTranscribeUrls = plugins.vjstranscribe?.urls || [];
    plugins.vjstranscribe = {
      ...plugins.vjstranscribe,
      urls: [transcripts.transcriptUrl, ...existingTranscribeUrls],
    };
  }
  return {
    ...options,
    plugins,
  };
}
