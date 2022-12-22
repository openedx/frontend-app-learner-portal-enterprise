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
