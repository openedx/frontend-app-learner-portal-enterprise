import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { useHistory } from 'react-router-dom';
import { connectRefinementList } from 'react-instantsearch-dom';

import { updateRefinementsFromQueryParams } from './data/utils';
import { NO_OPTIONS_FOUND } from './data/constants';
import FacetDropdown from './FacetDropdown';
import FacetItem from './FacetItem';

export const FacetListBase = ({
  title,
  attribute,
  items,
  currentRefinement,
  refinementsFromQueryParams,
}) => {
  const history = useHistory();

  /**
   * Handles when a facet option is toggled by either updating the appropriate
   * query parameter for the facet attribute, or removes the facet attribute if
   * there's no longer any selected options for that facet attribute.
   */
  const handleInputOnChange = (item) => {
    const refinements = { ...refinementsFromQueryParams };
    delete refinements.page; // reset to page 1

    if (item.value && item.value.length > 0) {
      refinements[attribute] = [...item.value];
    } else {
      delete refinements[attribute];
    }

    const updatedRefinements = updateRefinementsFromQueryParams(refinements);
    history.push({ search: qs.stringify(updatedRefinements) });
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
          isChecked={item.isRefined}
          isRefined={item.isRefined}
        />
      ));
    },
    [items],
  );

  return (
    <FacetDropdown
      items={renderItems()}
      title={title}
      isBold={currentRefinement.length > 0}
    />
  );
};

FacetListBase.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  attribute: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  currentRefinement: PropTypes.arrayOf(PropTypes.string).isRequired,
  refinementsFromQueryParams: PropTypes.shape().isRequired,
};

export default connectRefinementList(FacetListBase);
