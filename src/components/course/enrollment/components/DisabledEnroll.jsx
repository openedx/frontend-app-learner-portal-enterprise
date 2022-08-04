import React from 'react';
import PropTypes from 'prop-types';

import { EnrollButtonCta } from '../common';

function EnrollBtnDisabled({ enrollLabel }) {
  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      as="div"
      className="btn btn-light btn-block disabled d-block"
    />
  );
}

EnrollBtnDisabled.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
};

export default EnrollBtnDisabled;
