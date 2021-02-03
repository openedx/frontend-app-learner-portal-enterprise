import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { enrollLinkClass } from '../constants';
import { EnrollButtonCta } from '../common';

// Data sharing consent
const ToDataSharingConsentPage = ({ enrollLabel, enrollmentUrl }) => (
  <EnrollButtonCta
    enrollLabel={enrollLabel}
    as="a"
    className={classNames('btn btn-primary btn-brand-primary', enrollLinkClass)}
    href={enrollmentUrl}
  />
);

ToDataSharingConsentPage.propTypes = {
  enrollLabel: PropTypes.shape.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToDataSharingConsentPage;
