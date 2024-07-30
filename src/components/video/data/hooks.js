import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { fetchAndAddTranscripts } from './service';

export function useTranscripts({ player, customOptions }) {
  const shouldUseTranscripts = !!(customOptions?.showTranscripts && customOptions?.transcriptUrls);
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
  }, [customOptions?.transcriptUrls, player, shouldUseTranscripts]);

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
