import { useIntl } from '@edx/frontend-platform/i18n';
import {
  getHighlightedContentCardVariant,
  getFormattedContentType,
  getAuthoringOrganizations,
  getContentPageUrl,
} from './utils';

export const useHighlightedContentCardData = ({
  enterpriseSlug,
  highlightedContent,
}) => {
  const intl = useIntl();
  const cardData = {};

  if (!highlightedContent) {
    return cardData;
  }

  const {
    contentKey,
    contentType,
    title,
    cardImageUrl,
    authoringOrganizations,
    aggregationKey,
    courseRunStatuses,
  } = highlightedContent;

  cardData.aggregationKey = aggregationKey;
  cardData.variant = getHighlightedContentCardVariant(contentType);
  cardData.href = getContentPageUrl({
    contentKey,
    contentType,
    enterpriseSlug,
  });
  cardData.contentType = getFormattedContentType(contentType, intl);
  cardData.title = title;
  cardData.cardImageUrl = cardImageUrl;
  cardData.authoringOrganizations = getAuthoringOrganizations(authoringOrganizations);
  cardData.courseRunStatuses = courseRunStatuses;
  return cardData;
};
