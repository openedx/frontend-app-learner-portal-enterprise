import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import FacetDropdown from './FacetDropdown';
import FacetItem from './FacetItem';

import { NO_OPTIONS_FOUND } from './data/constants';

export const FacetList = ({
  title,
  items,
  showAllCatalogs,
  setShowAllCatalogs,
}) => {
  const handleInputOnChange = () => {
    setShowAllCatalogs(!showAllCatalogs);
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

FacetList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  title: PropTypes.string.isRequired,
  setShowAllCatalogs: PropTypes.func.isRequired,
  showAllCatalogs: PropTypes.bool.isRequired,
};

export default FacetList;
