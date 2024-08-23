export const convertToWebVtt = (transcriptData) => {
  const formatTime = (timeInMilliseconds) => {
    const pad = (num, size) => (`000${num}`).slice(size * -1);
    const hours = Math.floor(timeInMilliseconds / 3600000);
    const minutes = Math.floor((timeInMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((timeInMilliseconds % 60000) / 1000);
    const milliseconds = timeInMilliseconds % 1000;
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(milliseconds, 3)}`;
  };

  const removeImageTags = (text) => text.replace(/<img[^>]*>/g, '');

  const length = Math.min(transcriptData.start.length, transcriptData.end.length, transcriptData.text.length);

  let webVtt = 'WEBVTT\n\n';
  for (let index = 0; index < length; index++) {
    webVtt += `${index + 1}\n`;
    webVtt += `${formatTime(transcriptData.start[index])} --> ${formatTime(transcriptData.end[index])}\n`;
    webVtt += `${removeImageTags(transcriptData.text[index])}\n\n`;
  }

  return webVtt;
};

export const createWebVttFile = (webVttContent) => {
  const blob = new Blob([webVttContent], { type: 'text/vtt' });
  return URL.createObjectURL(blob);
};

export const sortTextTracks = (tracks, preferredLanguage) => {
  const sortedKeys = Object.keys(tracks).sort((a, b) => {
    if (a === preferredLanguage) { return -1; }
    if (b === preferredLanguage) { return 1; }
    return a.localeCompare(b);
  });

  return sortedKeys.reduce((acc, key) => {
    acc[key] = tracks[key];
    return acc;
  }, {});
};
