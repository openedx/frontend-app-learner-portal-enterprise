import { logError } from '@edx/frontend-platform/logging';
import { convertToWebVtt, createWebVttFile } from './utils';

const fetchAndAddTranscripts = async (transcriptUrls) => {
  const data = {};
  const transcriptPromises = Object.entries(transcriptUrls).map(([lang, url]) => fetch(url)
    .then(response => response.json())
    .then((transcriptData) => {
      const webVttData = convertToWebVtt(transcriptData);
      const webVttFileUrl = createWebVttFile(webVttData);
      data[lang] = webVttFileUrl;
    })
    .catch(error => {
      logError(`Error fetching or processing transcript for ${lang}: ${error}`);
    }));

  try {
    await Promise.all(transcriptPromises);
    return data;
  } catch (error) {
    logError(`Error fetching or processing transcripts: ${error}`);
    return data;
  }
};

export { fetchAndAddTranscripts };
