import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';

import {
  getContentHighlights,
  getEnterpriseCuration,
} from './service';
import {
  getHighlightedContentCardVariant,
  getFormattedContentType,
  getAuthoringOrganizations,
  getContentPageUrl,
} from './utils';

export const useContentHighlights = (enterpriseUUID) => {
  const [isLoading, setIsLoading] = useState(true);
  const [contentHighlights, setContentHighlights] = useState([]);
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchContentHighlights = async () => {
      try {
        setIsLoading(true);
        const response = await getContentHighlights(enterpriseUUID);
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
  }, [enterpriseUUID]);

  return {
    isLoading,
    contentHighlights,
    fetchError,
  };
};

export const useEnterpriseCuration = (enterpriseUUID) => {
  const [isLoading, setIsLoading] = useState(true);
  const [enterpriseCuration, setEnterpriseCuration] = useState({});
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchEnterpriseCuration = async () => {
      try {
        setIsLoading(true);
        const response = await getEnterpriseCuration(enterpriseUUID);
        const results = camelCaseObject(response.data.results);
        // if no enterprise curation config is found, fallback to an empty object to match the initial state.
        const enterpriseCurationConfig = results[0] || { canOnlyViewHighlightSets: false };
        setEnterpriseCuration(enterpriseCurationConfig);
      } catch (err) {
        logError(err);
        setFetchError(err);
        setEnterpriseCuration({ canOnlyViewHighlightSets: false });
      } finally {
        setIsLoading(false);
      }
    };
    if (getConfig().FEATURE_CONTENT_HIGHLIGHTS) {
      fetchEnterpriseCuration();
    }
  }, [enterpriseUUID]);

  return {
    isLoading,
    enterpriseCuration,
    fetchError,
  };
};

export const useHighlightedContentCardData = ({
  enterpriseSlug,
  highlightedContent,
}) => {
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
  } = highlightedContent;

  cardData.aggregationKey = aggregationKey;
  cardData.variant = getHighlightedContentCardVariant(contentType);
  cardData.href = getContentPageUrl({
    contentKey,
    contentType,
    enterpriseSlug,
  });
  cardData.contentType = getFormattedContentType(contentType);
  cardData.title = title;
  cardData.cardImageUrl = cardImageUrl;
  cardData.authoringOrganizations = getAuthoringOrganizations(authoringOrganizations);

  return cardData;
};
