export const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
export const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';
export const TEST_IMAGE_URL = 'https://fake.image';
export const TEST_PATHWAY_DATA = {
  uuid: '9d7c7c42-682d-4fa4-a133-2913e939f771',
  name: 'Computer Science Career Builder',
  overview: 'Learn CS',
  banner_image: 'https://example.com/pathway.banner.image.png',
  status: 'active',
  steps: [
    {
      min_requirement: 1,
      courses: [
        {
          title: 'CS50',
          short_description: 'Learn CS50',
          card_image_url: 'https://example.com/course.card.png',
          content_type: 'course',
          key: 'TestX+CS50x',

        },
      ],
      programs: [],
    },
    {
      min_requirement: 1,
      courses: [],
      programs: [
        {
          title: 'Python Basics for Data Science',
          short_description: 'Learn DS',
          card_image_url: 'https://example.com/program.card.png',
          content_type: 'program',
          uuid: '9d91b42a-f3e4-461a-b9e1-e53a4fc927ed',
        },
      ],
    },
  ],
};
