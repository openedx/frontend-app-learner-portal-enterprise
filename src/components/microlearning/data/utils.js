import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export const formatDuration = (durationInSeconds) => {
  const time = dayjs.duration({ seconds: durationInSeconds });
  const minutes = Math.floor(time.asMinutes());
  const seconds = durationInSeconds ? (durationInSeconds % 60).toFixed(0).padStart(2, '0') : 0;
  return `${minutes}:${seconds}`;
};

export const formatSkills = (skills) => skills?.map(skill => ({
  name: skill?.name,
  description: skill?.description,
  category: skill?.category?.name,
  subcategory: skill?.subcategory?.name,
}));

export const transformVideoData = (data) => ({
  videoUrl: data?.json_metadata?.download_link,
  courseTitle: data?.parent_content_metadata?.title,
  videoSummary: data?.summary_transcripts?.[0],
  transcriptUrls: data?.json_metadata?.transcript_urls,
  videoSkills: formatSkills(data?.skills),
  videoDuration: formatDuration(data?.json_metadata?.duration),
});
