import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';

import { NO_OPTIONS_FOUND } from './data/constants';
import FacetDropdown from './FacetDropdown';
import FacetItem from './FacetItem';
import { SearchContext } from './SearchContext';
import {
  setArrayValue, setKeyAction, deleteKeyAction, removeArrayValue,
} from './data/actions';

const FacetListBase = ({
  title,
  items,
  isBold,
  isCheckedOrRefinedField,
  facetName,
  facetValueType,
}) => {
  /**
   * Handles when a facet option is toggled by either updating the appropriate
   * query parameter for the facet attribute, or removes the facet attribute if
   * there's no longer any selected options for that facet attribute.
   */

  const { activeRefinements: refinementsFromQueryParams, refinementsDispatch: dispatch } = useContext(SearchContext);
  const handleInputOnChange = (item) => {
    if (item.value && facetValueType === 'array') {
      if (item.value.length > 0) {
        if (refinementsFromQueryParams[facetName]?.includes(item.label)) {
          dispatch(removeArrayValue(facetName, item.label));
        } else {
          dispatch(setArrayValue(facetName, item.label));
        }
      } else {
        dispatch(deleteKeyAction(facetName));
      }
    } else if (facetValueType === 'bool') {
      // eslint-disable-next-line no-bitwise
      dispatch(setKeyAction(facetName, refinementsFromQueryParams[item.name] ^ 1));
    }
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
  isCheckedOrRefinedField: null,
};

FacetListBase.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  title: PropTypes.string.isRequired,
  isBold: PropTypes.bool.isRequired,
  isCheckedOrRefinedField: PropTypes.string,
  facetName: PropTypes.string.isRequired,
  facetValueType: PropTypes.oneOf(['array', 'bool']).isRequired,
};

export default FacetListBase;
