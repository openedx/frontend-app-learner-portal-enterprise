import React from 'react';
import PropTypes from 'prop-types';

import { Stack } from '@edx/paragon';
import { EnrollButtonCta } from '../common';
import { useTrackSearchConversionClickHandlerLocalUrl } from '../../data/hooks';
import { EVENT_NAMES } from '../constants';

/**
 * Renders a hyperlink to the ExecutiveEducation2UPage
 */
const ToExecutiveEducation2UEnrollment = ({
  enrollmentUrl,
}) => {
  const handleSearchConversionStart = useTrackSearchConversionClickHandlerLocalUrl({
    href: enrollmentUrl,
    eventName: EVENT_NAMES.clickedToEnrollPage,
  });

  return (
    <Stack>
      <EnrollButtonCta
        enrollLabel="Enroll"
        onClick={handleSearchConversionStart}
      />
    </Stack>
  );
};

ToExecutiveEducation2UEnrollment.propTypes = {
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToExecutiveEducation2UEnrollment;
