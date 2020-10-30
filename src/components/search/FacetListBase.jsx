import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { useHistory } from 'react-router-dom';

import { updateRefinementsFromQueryParams } from './data/utils';
import { NON_FACET_FILTERS, NO_OPTIONS_FOUND } from './data/constants';
import FacetDropdown from './FacetDropdown';
import FacetItem from './FacetItem';

const FacetListBase = ({
  title,
  items,
  isBold,
  refinementsFromQueryParams,
  handleItemChange,
  isCheckedOrRefinedField,
  attribute,
}) => {
  const history = useHistory();

  /**
   * Handles when a facet option is toggled by either updating the appropriate
   * query parameter for the facet attribute, or removes the facet attribute if
   * there's no longer any selected options for that facet attribute.
   */
  const handleInputOnChange = (item) => {
    const refinements = { ...refinementsFromQueryParams };

    console.log('refinementsFROMQUERY handleInput', refinements)
    delete refinements.page; // reset to page 1
    if (item.value && Array.isArray(item.value) && item.value.length > 0) {
      refinements[attribute] = [...item.value];
    } else if (NON_FACET_FILTERS.includes(attribute)) {

      refinements[attribute] = handleItemChange(item);
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

      return items.map(item => {
        const isCheckOrRefined = isCheckedOrRefinedField ? item[isCheckedOrRefinedField] : !!item.value;

        return (
          <FacetItem
            key={item.label}
            handleInputOnChange={handleInputOnChange}
            item={item}
            isChecked={isCheckOrRefined}
            isRefined={isCheckOrRefined}
          />
        );
      });
    },
    [items],
  );

  return (
    <FacetDropdown
      items={renderItems()}
      title={title}
      isBold={isBold}
    />
  );
};

FacetListBase.defaultProps = {
  handleItemChange: null,
  isCheckedOrRefinedField: null,
};

FacetListBase.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  title: PropTypes.string.isRequired,
  attribute: PropTypes.string.isRequired,
  isBold: PropTypes.bool.isRequired,
  refinementsFromQueryParams: PropTypes.shape().isRequired,
  handleItemChange: PropTypes.func,
  isCheckedOrRefinedField: PropTypes.string,
};

export default FacetListBase;
