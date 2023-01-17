import '@testing-library/jest-dom/extend-expect';
import { getContentTypeSet } from '../utils';

describe('utils', () => {
  it('should return a set of content types given an array of contentHighlights', () => {
    const contentHighlights = [
      {
        highlightedContent: [
          {
            contentType: 'course',
          },
          {
            contentType: 'program',
          },
        ],
      },
      {
        highlightedContent: [
          {
            contentType: 'program',
          },
          {
            contentType: 'learnerpathway',
          },
        ],
      },
    ];
    const contentTypeSet = new Set(['course', 'program', 'learnerpathway']);
    expect(getContentTypeSet(contentHighlights)).toEqual(contentTypeSet);
  });
  it('should return a set of content types given an array of contentHighlights', () => {
    const contentTypes = ['course', 'program', 'learnerpathway'];
    for (let i = 0; i < contentTypes.length; i++) {
      const contentHighlights = [
        {
          highlightedContent: [
            {
              contentType: contentTypes[i],
            },
            {
              contentType: contentTypes[i],
            },
          ],
        },
        {
          highlightedContent: [
            {
              contentType: contentTypes[i],
            },
            {
              contentType: contentTypes[i],
            },
          ],
        },
      ];
      const contentTypeSet = new Set([contentTypes[i]]);
      expect(getContentTypeSet(contentHighlights)).toEqual(contentTypeSet);
    }
  });
  it('should return an empty set if there are no contentHighlights', () => {
    const contentHighlights = [];
    const contentTypeSet = new Set();
    expect(getContentTypeSet(contentHighlights)).toEqual(contentTypeSet);
  });
  it('should return an empty set if there are no highlightedContent', () => {
    const contentHighlights = [
      {
        highlightedContent: [],
      },
      {
        highlightedContent: [],
      },
    ];
    const contentTypeSet = new Set(['']);
    expect(getContentTypeSet(contentHighlights)).toEqual(contentTypeSet);
  });
});
