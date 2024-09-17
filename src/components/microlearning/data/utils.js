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
  courseTitle: data?.title || data?.parent_content_metadata?.title,
  videoSummary: data?.summary_transcripts?.[0],
  transcriptUrls: data?.json_metadata?.transcript_urls,
  videoSkills: formatSkills(data?.skills),
  videoDuration: formatDuration(data?.json_metadata?.duration),
  institutionLogo: data?.parent_content_metadata?.logo_image_urls[0],
  courseKey: data?.parent_content_metadata?.parent_content_key,
  videoUsageKey: data?.video_usage_key,
});

export const getLevelType = (intl, level) => {
  switch (level) {
    case 'Introductory':
      return {
        level: intl.formatMessage({
          id: 'enterprise.courseAbout.sidebarLevel.Introductory',
          defaultMessage: 'Introductory',
          description: 'Level of the course',
        }),
        description: intl.formatMessage({
          id: 'enterprise.courseAbout.sidebarLevel.introductory.description',
          defaultMessage: 'No prior experience required',
          description: 'Introductory level of the course',
        }),
      };
    case 'Intermediate':
      return {
        level: intl.formatMessage({
          id: 'enterprise.courseAbout.sidebarLevel.intermediate',
          defaultMessage: 'Intermediate',
          description: 'Level of the course',
        }),
        description: intl.formatMessage({
          id: 'enterprise.courseAbout.sidebarLevel.intermediate.description',
          defaultMessage: 'Some prior experience recommended',
          description: 'Intermediate level of the course',
        }),
      };
    case 'Advanced':
      return {
        level: intl.formatMessage({
          id: 'enterprise.courseAbout.sidebarLevel.Advanced',
          defaultMessage: 'Advanced',
          description: 'Level of the course',
        }),
        description: intl.formatMessage({
          id: 'enterprise.courseAbout.sidebarLevel.advanced.description',
          defaultMessage: 'Extensive prior experience recommended',
          description: 'Advanced level of the course',
        }),
      };
    default:
      return {
        level,
        description: '',
      };
  }
};
