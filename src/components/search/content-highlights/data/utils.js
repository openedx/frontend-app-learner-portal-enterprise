export const getHighlightedContentCardVariant = contentType => (contentType === 'course' ? 'light' : 'dark');

export const getFormattedContentType = (contentType) => {
  const formattedContentTypes = {
    course: 'Course',
    program: 'Program',
    learnerpathway: 'Pathway',
  };
  return formattedContentTypes[contentType];
};

export const getAuthoringOrganizations = (authoringOrganizations) => {
  const authoringOrganizationsData = {
    content: authoringOrganizations.map(org => org.name).join(', '),
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
export const getContentTypeSet = (contentHighlights) => {
  if (contentHighlights.length < 1) {
    return new Set();
  }
  const contentTypeSet = new Set(contentHighlights.map(highlight => highlight.highlightedContent.map(content => content.contentType).join(' ')).join(' ').split(' '));
  if (contentTypeSet.size > 0) {
    return contentTypeSet;
  }
  return new Set();
};
