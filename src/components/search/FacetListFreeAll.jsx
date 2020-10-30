import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import qs from 'query-string';
import FacetListBase from './FacetListBase';
import { FREE_ALL_ATTRIBUTE, SHOW_ALL_NAME } from './data/constants';

const FacetListFreeAll = ({
  showAllCatalogs,
  setShowAllCatalogs,
  refinementsFromQueryParams,
  ...props
}) => {
  const { search } = useLocation();
  const queryParams = useMemo(
    () => qs.parse(search),
    [search],
  );
  console.log('QUERY PARAMS Free/ALL', queryParams);
  const showAllFromQuery = +queryParams[FREE_ALL_ATTRIBUTE];

  useEffect(() => {
    console.log('USE ALL')
    if ([0, 1].includes(showAllFromQuery) && showAllFromQuery !== showAllCatalogs) {
      console.log('setting show all to ', showAllFromQuery)
      setShowAllCatalogs(showAllFromQuery);
    }
  }, [queryParams]);

  return (
    <FacetListBase
      isBold
      refinementsFromQueryParams={refinementsFromQueryParams}
      handleItemChange={(item) => {
        return item.name === SHOW_ALL_NAME ? 1 : 0;
      }}
      {...props}
    />
  );
};

FacetListFreeAll.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  title: PropTypes.string.isRequired,
  setShowAllCatalogs: PropTypes.func.isRequired,
  showAllCatalogs: PropTypes.number.isRequired,
  refinementsFromQueryParams: PropTypes.shape().isRequired,
};

export default FacetListFreeAll;
