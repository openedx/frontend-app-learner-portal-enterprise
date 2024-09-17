import { formatDuration, formatSkills, transformVideoData } from './utils';

describe('Microlearning utils tests', () => {
  const mockSkills = [
    {
      name: 'Skill 1',
      description: 'Description 1',
      category: { name: 'Category 1' },
      subcategory: { name: 'Subcategory 1' },
    },
    {
      name: 'Skill 2',
      description: 'Description 2',
      category: { name: 'Category 2' },
      subcategory: { name: 'Subcategory 2' },
    },
  ];

  const mockData = {
    json_metadata: {
      download_link: 'http://example.com/video.mp4',
      transcript_urls: ['http://example.com/transcript1.vtt'],
      duration: 123,
    },
    parent_content_metadata: {
      title: 'Course Title',
      logo_image_urls: ['http://example.com/logo.png'],
      parent_content_key: 'course-key',
    },
    summary_transcripts: [
      'Transcript 1', 'Transcript 2',
    ],
    skills: [
      {
        name: 'Skill 1',
        description: 'Description 1',
        category: { name: 'Category 1' },
        subcategory: { name: 'Subcategory 1' },
      },
    ],
    video_usage_key: 'block-v1:InSendItx+WeTrustx+2T2024+type@video+block@86753094ab4b62be73e7188934982e',
  };

  it('should format 60 seconds correctly', () => {
    expect(formatDuration(60)).toBe('1:00');
  });

  it('should format skills correctly', () => {
    expect(formatSkills(mockSkills)).toEqual([
      {
        name: 'Skill 1',
        description: 'Description 1',
        category: 'Category 1',
        subcategory: 'Subcategory 1',
      },
      {
        name: 'Skill 2',
        description: 'Description 2',
        category: 'Category 2',
        subcategory: 'Subcategory 2',
      },
    ]);
  });

  it('should handle empty skills list', () => {
    expect(formatSkills([])).toEqual([]);
  });

  it('should transform video data correctly', () => {
    expect(transformVideoData(mockData)).toEqual({
      videoUrl: 'http://example.com/video.mp4',
      courseTitle: 'Course Title',
      videoSummary: 'Transcript 1',
      transcriptUrls: ['http://example.com/transcript1.vtt'],
      videoSkills: [
        {
          name: 'Skill 1',
          description: 'Description 1',
          category: 'Category 1',
          subcategory: 'Subcategory 1',
        },
      ],
      videoDuration: '2:03',
      institutionLogo: 'http://example.com/logo.png',
      courseKey: 'course-key',
      videoUsageKey: 'block-v1:InSendItx+WeTrustx+2T2024+type@video+block@86753094ab4b62be73e7188934982e',
    });
  });

  it('should handle missing fields gracefully', () => {
    const incompleteData = {};

    expect(transformVideoData(incompleteData)).toEqual({
      videoUrl: undefined,
      courseTitle: undefined,
      videoSummary: undefined,
      transcriptUrls: undefined,
      videoSkills: undefined,
      videoDuration: '0:0',
    });
  });
});
