import { formatDuration, formatSkills, transformVideoData } from './utils';

describe('Microlearning utils tests', () => {
  const mockSkills = {
    'list-item': [
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
    ],
  };

  const mockData = {
    json_metadata: {
      download_link: 'http://example.com/video.mp4',
      transcript_urls: ['http://example.com/transcript1.vtt'],
      duration: 123,
    },
    parent_content_metadata: {
      title: 'Course Title',
    },
    summary_transcripts: {
      'list-item': ['Transcript 1', 'Transcript 2'],
    },
    skills: {
      'list-item': [
        {
          name: 'Skill 1',
          description: 'Description 1',
          category: { name: 'Category 1' },
          subcategory: { name: 'Subcategory 1' },
        },
      ],
    },
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
    expect(formatSkills({ 'list-item': [] })).toEqual([]);
  });

  it('should transform video data correctly', () => {
    expect(transformVideoData(mockData)).toEqual({
      videoUrl: 'http://example.com/video.mp4',
      courseTitle: 'Course Title',
      videoSummary: ['Transcript 1', 'Transcript 2'],
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
