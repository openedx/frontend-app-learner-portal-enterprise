import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';

import {
  getExecutiveEducation2UContentMetadata,
} from './service';

export function useActiveQueryParams() {
  const location = useLocation();
  const activeQueryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  return activeQueryParams;
}

export function useExecutiveEducation2UContentMetadata({
  courseUUID,
  isExecEd2UFulfillmentEnabled,
}) {
  const [isLoadingContentMetadata, setIsLoadingContentMetadata] = useState(isExecEd2UFulfillmentEnabled);
  const [contentMetadata, setContentMetadata] = useState();

  useEffect(() => {
    const fetchContentMetadata = async () => {
      setIsLoadingContentMetadata(true);
      try {
        const metadata = await getExecutiveEducation2UContentMetadata(courseUUID);
        setContentMetadata(metadata);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoadingContentMetadata(false);
      }
    };
    if (isExecEd2UFulfillmentEnabled) {
      fetchContentMetadata();
    }
  }, [isExecEd2UFulfillmentEnabled, courseUUID]);

  return {
    isLoadingContentMetadata,
    contentMetadata,
  };
}
