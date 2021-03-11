import React from 'react';
import PropTypes from 'prop-types';

import { EnrollButtonCta } from '../common';

const EnrollBtnDisabled = ({ enrollLabel }) => (
  <EnrollButtonCta
    enrollLabel={enrollLabel}
    as="div"
    className="btn btn-light btn-block disabled"
  />
);

EnrollBtnDisabled.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
};

export default EnrollBtnDisabled;
