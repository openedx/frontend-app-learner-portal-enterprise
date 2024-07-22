import { logError } from '@edx/frontend-platform/logging';
import { convertToWebVtt, createWebVttFile } from './utils';

const fetchAndAddTranscripts = async (transcriptUrls, player) => {
  const transcriptPromises = Object.entries(transcriptUrls).map(([lang, url]) => fetch(url)
    .then(response => {
      if (!response.ok) {
        logError(`Failed to fetch transcript for ${lang}`);
      }
      return response.json();
    })
    .then(transcriptData => {
      const webVttData = convertToWebVtt(transcriptData);
      const webVttFileUrl = createWebVttFile(webVttData);

      player.addRemoteTextTrack({
        kind: 'subtitles',
        src: webVttFileUrl,
        srclang: lang,
        label: lang,
      }, false);

      // We are only catering to English transcripts for now as we don't have the option to change
      // the transcript language yet.
      if (lang === 'en') {
        player.vjstranscribe({
          urls: [webVttFileUrl],
        });
      }
    })
    .catch(error => {
      logError(`Error fetching or processing transcript for ${lang}:`, error);
    }));

  try {
    await Promise.all(transcriptPromises);
  } catch (error) {
    logError('Error fetching or processing transcripts:', error);
  }
};

export { fetchAndAddTranscripts };
