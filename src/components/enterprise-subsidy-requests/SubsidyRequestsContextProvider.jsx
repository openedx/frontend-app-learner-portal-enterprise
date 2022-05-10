import React from 'react';
import PropTypes from 'prop-types';
import { features } from '../../config';
import SubsidyRequestsContext, { INITIAL_CONTEXT } from './SubsidyRequestsContext';
import EnabledSubsidyRequestsContextProvider from './EnabledSubsidyRequestsContextProvider';

const SubsidyRequestsContextProvider = (props) => {
  if (features.FEATURE_BROWSE_AND_REQUEST) {
    return <EnabledSubsidyRequestsContextProvider {...props} />;
  }

  return (
    <SubsidyRequestsContext.Provider value={INITIAL_CONTEXT}>
      {props.children}
    </SubsidyRequestsContext.Provider>
  );
};

SubsidyRequestsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SubsidyRequestsContextProvider;
