import { getCourseStartDate } from './utils';

describe('Utility function tests', () => {
  it('Validate additionalMetadata gets priority in course start date calculation', async () => {
    const startDate = getCourseStartDate(
      {
        additionalMetadata: {
          startDate: '2023-06-07T00:00:00Z',
        },
      },
      {
        start: '2022-06-08T00:00:00Z',
      },
    );
    expect(startDate).toMatch('Jun 7, 2023');
  });

  it('Validate active course run\'s start date is used when additionalMetadata is null.', async () => {
    const startDate = getCourseStartDate(
      {
        additionalMetadata: null,
      },
      {
        start: '2022-06-08T00:00:00Z',
      },
    );
    expect(startDate).toMatch('Jun 8, 2022');
  });

  it('Validate getCourseDate handles empty data for course run and course metadata.', async () => {
    const startDate = getCourseStartDate(
      null,
      null,
    );
    expect(startDate).toBe(undefined);
  });
});
