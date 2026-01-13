import '@testing-library/jest-dom/extend-expect';
import {
  getHighlightsContentTypeSet,
  getFormattedContentType,
  getAuthoringOrganizations,
  getContentPageUrl,
} from '../utils';

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: jest.fn(() => ({
    formatMessage: jest.fn((msg) => msg.defaultMessage),
  })),
  defineMessages: jest.fn((msgs) => msgs),
}));

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
    expect(getHighlightsContentTypeSet(contentHighlights)).toEqual(contentTypeSet);
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
      expect(getHighlightsContentTypeSet(contentHighlights)).toEqual(contentTypeSet);
    }
  });
  it('should return an empty set if there are no contentHighlights', () => {
    const contentHighlights = [];
    const contentTypeSet = new Set();
    expect(getHighlightsContentTypeSet(contentHighlights)).toEqual(contentTypeSet);
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
    expect(getHighlightsContentTypeSet(contentHighlights)).toEqual(contentTypeSet);
  });
  it('should return the correct formatted content type', () => {
    const mockIntl = {
      formatMessage: jest.fn(({ defaultMessage }) => defaultMessage),
    };

    const contentTypes = ['course', 'program', 'learnerpathway'];
    const formattedContentTypes = ['Course', 'Program', 'Pathway'];

    for (let i = 0; i < contentTypes.length; i++) {
      expect(
        getFormattedContentType(contentTypes[i], mockIntl),
      ).toEqual(formattedContentTypes[i]);
    }
  });
  it('returns formatted content types using intl.formatMessage', () => {
    const mockIntl = {
      formatMessage: jest.fn(({ defaultMessage }) => defaultMessage),
    };

    const cases = [
      ['course', 'Course'],
      ['program', 'Program'],
      ['learnerpathway', 'Pathway'],
    ];

    cases.forEach(([contentType, expected]) => {
      expect(getFormattedContentType(contentType, mockIntl)).toBe(expected);
    });

    expect(mockIntl.formatMessage).toHaveBeenCalledTimes(cases.length);
  });
  it('should return formatted authoring organization data', () => {
    const multipleAuthoringOrganizations = [
      {
        name: 'Test Org 1',
        logoImageUrl: 'http://test.com',
      },
      {
        name: 'Test Org 2',
        logoImageUrl: 'http://test.com',
      },
    ];
    const multipleAuthoringOrganizationsData = {
      content: 'Test Org 1, Test Org 2',
    };
    const singleAuthoringOrganization = [
      {
        name: 'Test Org 1',
        logoImageUrl: 'http://test.com',
      },
    ];
    const singleAuthoringOrganizationsData = {
      content: 'Test Org 1',
      logoImageUrl: 'http://test.com',
    };
    expect(getAuthoringOrganizations(multipleAuthoringOrganizations)).toEqual(multipleAuthoringOrganizationsData);
    expect(getAuthoringOrganizations(singleAuthoringOrganization)).toEqual(singleAuthoringOrganizationsData);
  });
  it('should return the correct content page url', () => {
    const enterpriseSlug = 'test-enterprise-slug';
    const contentTypes = ['course', 'program', 'learnerpathway', 'user_enrollment'];
    const contentKey = ['edX+Demo', 'Harvard-123', 'Stanford-456'];
    const contentPageUrls = [
      `/${enterpriseSlug}/course/${contentKey[0]}`,
      `/${enterpriseSlug}/program/${contentKey[1]}`,
      `/${enterpriseSlug}/search/${contentKey[2]}`,
    ];
    for (let i = 0; i < contentTypes.length; i++) {
      expect(getContentPageUrl({
        contentKey: contentKey[i],
        contentType: contentTypes[i],
        enterpriseSlug,
      })).toEqual(contentPageUrls[i]);
    }
  });
});
