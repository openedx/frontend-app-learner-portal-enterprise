import {
  useState, useEffect,
} from 'react';

import {
  fetchEnterpriseCatalogData,
} from './service';

export function useCatalogData(enterpriseId) {
  const [catalogData, setCatalogData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const response = await fetchEnterpriseCatalogData(enterpriseId);
        setCatalogData(response.data);
      } catch {
        setCatalogData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, [enterpriseId]);

  return [catalogData, isLoading];
}
