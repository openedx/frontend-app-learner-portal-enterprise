import {
  useState, useEffect,
} from 'react';

import {
  fetchEnterpriseCatalogData, fetchLearningPathData,
} from './service';

export function useCatalogData(enterpriseId) {
  const [catalogData, setCatalogData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const response = await fetchEnterpriseCatalogData(enterpriseId);
        setCatalogData(response.data);
      } catch {
        setCatalogData({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, [enterpriseId]);

  return [catalogData, isLoading];
}

export function useLearningPathData() {
  const [learningPathData, setLearningPathData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const response = await fetchLearningPathData();
        setLearningPathData(response.data);
      } catch {
        setLearningPathData({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, []);

  return [learningPathData, isLoading];
}
