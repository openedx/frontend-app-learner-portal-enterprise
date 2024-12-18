import PropTypes from 'prop-types';

import { EnrollButtonCta } from '../common';

const EnrollBtnDisabled = ({ enrollLabel }) => (
  <EnrollButtonCta
    enrollLabel={enrollLabel}
    block
    disabled
  />
);

EnrollBtnDisabled.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
};

export default EnrollBtnDisabled;
