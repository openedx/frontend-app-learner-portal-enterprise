import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Hyperlink } from '@edx/paragon';

import { useTrackSearchConversionClickHandler } from '../../data/hooks';
import { enrollLinkClass } from '../constants';
import { EnrollButtonCta } from '../common';

// Data sharing consent
const ToDataSharingConsentPage = ({ enrollLabel, enrollmentUrl }) => {
  const handleClick = useTrackSearchConversionClickHandler({
    href: enrollmentUrl,
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_dsc.clicked',
  });

  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      as={Hyperlink}
      className={classNames('btn btn-primary btn-brand-primary d-block', enrollLinkClass)}
      destination={enrollmentUrl}
      onClick={handleClick}
    />
  );
};

ToDataSharingConsentPage.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToDataSharingConsentPage;
