// eslint-disable-next-line import/prefer-default-export

export const LOADING_SCREEN_READER_TEXT = 'loading your edX benefits from your organization';

export const filterInitial = {
  learningPaths: [],
  languages: [],
  difficultyLevels: [],
  deliveryMethods: [],
};

export const filterGroups = [
  { id: 'learningPaths', label: 'Learning path' },
  { id: 'languages', label: 'Language' },
  { id: 'difficultyLevels', label: 'Difficulty level' },
  { id: 'deliveryMethods', label: 'Delivery methods' },
];

export const filterOptions = {
  learningPaths: [
    { value: 1, label: 'Product Management' },
    { value: 2, label: 'Software Development' },
    { value: 3, label: 'Data Science 1' },
    { value: 4, label: 'QA/QC Engineering' },
    { value: 5, label: 'Industrial Engineering' },
    { value: 6, label: 'Machine Learning 1' },
    { value: 7, label: 'Systems Engineering' },
    { value: 8, label: 'Software Architecture' },
    { value: 9, label: 'Test Engineering' },
    { value: 10, label: 'Data Science 2' },
    { value: 11, label: 'Data Science 3' },
    { value: 12, label: 'Data Science 4' },
    { value: 13, label: 'Data Science 5' },
    { value: 14, label: 'Machine Learning 2' },
  ],
  languages: [
    {
      value: 'en',
      label: 'EN',
    },
    {
      value: 'jp',
      label: '日本',
    },
  ],
  difficultyLevels: [
    {
      value: 'Basic',
      label: 'Basic',
    },
    {
      value: 'Intermediate',
      label: 'Intermediate',
    },
    {
      value: 'Advanced',
      label: 'Advanced',
    },
  ],
  deliveryMethods: [
    {
      value: 'self_paced',
      label: 'Self paced',
    },
    {
      value: 'face_to_face',
      label: 'Face to face',
    },
    {
      value: 'individual_lessons',
      label: 'Individual lessons',
    },
  ],
};
