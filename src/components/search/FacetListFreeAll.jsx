import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import qs from 'query-string';
import FacetDropdown from './FacetDropdown';
import FacetItem from './FacetItem';

import { NO_OPTIONS_FOUND } from './data/constants';

const FacetListFreeAll = ({
  title,
  items,
  showAllCatalogs,
  setShowAllCatalogs,
  refinementsFromQueryParams,
}) => {
  const history = useHistory();
  const handleInputOnChange = () => {
    const refinements = { ...refinementsFromQueryParams };
    delete refinements.page; // reset to page 1
    setShowAllCatalogs(!showAllCatalogs);
    history.push({ search: qs.stringify(refinements) });
  };

  const renderItems = useCallback(
    () => {
      if (!items || !items.length) {
        return <span className="py-2 px-2">{NO_OPTIONS_FOUND}</span>;
      }

      return items.map(item => (
        <FacetItem
          key={item.label}
          handleInputOnChange={handleInputOnChange}
          item={item}
          isChecked={item.value}
          isRefined={item.value}
        />
      ));
    },
    [items],
  );

  return (
    <FacetDropdown
      items={renderItems()}
      title={title}
      isBold
    />
  );
};

FacetListFreeAll.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  title: PropTypes.string.isRequired,
  setShowAllCatalogs: PropTypes.func.isRequired,
  showAllCatalogs: PropTypes.bool.isRequired,
  refinementsFromQueryParams: PropTypes.shape().isRequired,
};

export default FacetListFreeAll;
