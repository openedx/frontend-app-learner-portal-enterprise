import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  course: {
    id: 'enterprise.search.contentHighlights.contentType.course',
    defaultMessage: 'Course',
    description: 'Label for course content type in content highlights.',
  },
  program: {
    id: 'enterprise.search.contentHighlights.contentType.program',
    defaultMessage: 'Program',
    description: 'Label for program content type in content highlights.',
  },
  learnerpathway: {
    id: 'enterprise.search.contentHighlights.contentType.learnerpathway',
    defaultMessage: 'Pathway',
    description: 'Label for learner pathway content type in content highlights.',
  },
});

export const getHighlightedContentCardVariant = contentType => (contentType === 'course' ? 'light' : 'dark');

export const getFormattedContentType = (contentType, intl) => {
  const message = messages[contentType];
  return message ? intl.formatMessage(message) : contentType;
};

export const getAuthoringOrganizations = (authoringOrganizations) => {
  if (!authoringOrganizations) {
    return {
      content: '',
    };
  }
  const authoringOrganizationsData = {
    content: authoringOrganizations?.map(org => org.name).join(', '),
  };
  if (authoringOrganizations.length === 1) {
    authoringOrganizationsData.logoImageUrl = authoringOrganizations[0].logoImageUrl;
  }
  return authoringOrganizationsData;
};

export const getContentPageUrl = ({
  contentKey,
  contentType,
  enterpriseSlug,
}) => {
  if (contentType === 'course') {
    return `/${enterpriseSlug}/course/${contentKey}`;
  }

  if (contentType === 'program') {
    return `/${enterpriseSlug}/program/${contentKey}`;
  }

  if (contentType === 'learnerpathway') {
    return `/${enterpriseSlug}/search/${contentKey}`;
  }

  return undefined;
};
/**
 * Takes in the contentHighlights from useContentHighlights hook, and returns a set of contentTypes
 * based on all of the highlight sets and its corresponding highlighted content
 * @param {Object} contentHighlights
 * @returns {Set} contentTypeSet
 */
export const getHighlightsContentTypeSet = (contentHighlights) => {
  if (contentHighlights.length > 0) {
    const contentTypeSet = new Set(contentHighlights.map(highlight => highlight.highlightedContent.map(content => content.contentType).join(' ')).join(' ').split(' '));
    if (contentTypeSet.size > 0) {
      return contentTypeSet;
    }
  }
  return new Set();
};
