import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';

import {
  getEnterpriseCuration,
} from './service';

import {
  getHighlightedContentCardVariant,
  getFormattedContentType,
  getAuthoringOrganizations,
  getContentPageUrl,
} from './utils';

export const useEnterpriseCuration = (enterpriseUUID) => {
  const [isLoading, setIsLoading] = useState(true);
  const [enterpriseCuration, setEnterpriseCuration] = useState({});
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    if (!enterpriseUUID) {
      return;
    }

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
    courseRunStatuses,
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
  cardData.courseRunStatuses = courseRunStatuses;
  return cardData;
};
