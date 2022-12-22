import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';

import { getContentHighlights } from './service';
import {
  getHighlightedContentCardVariant,
  getFormattedContentType,
  getAuthoringOrganizations,
} from './utils';

export const useContentHighlights = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [contentHighlights, setContentHighlights] = useState([]);
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchContentHighlights = async () => {
      try {
        setIsLoading(true);
        const response = await getContentHighlights();
        const results = camelCaseObject(response.data.results);
        const highlightSetsWithContent = results.filter(highlightSet => highlightSet.highlightedContent.length > 0);
        setContentHighlights(highlightSetsWithContent);
      } catch (err) {
        logError(err);
        setFetchError(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (getConfig().FEATURE_CONTENT_HIGHLIGHTS) {
      fetchContentHighlights();
    }
  }, []);

  return {
    isLoading,
    contentHighlights,
    fetchError,
  };
};

export const useHighlightedContentCardData = (highlightedContent) => {
  const cardData = {};

  if (!highlightedContent) {
    return cardData;
  }

  const {
    contentType,
    title,
    cardImageUrl,
    authoringOrganizations,
  } = highlightedContent;

  cardData.variant = getHighlightedContentCardVariant(contentType);
  cardData.contentType = getFormattedContentType(contentType);
  cardData.title = title;
  cardData.cardImageUrl = cardImageUrl;
  cardData.authoringOrganizations = getAuthoringOrganizations(authoringOrganizations);

  return cardData;
};
