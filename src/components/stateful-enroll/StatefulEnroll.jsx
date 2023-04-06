import React, { useState } from 'react';
import { StatefulButton } from '@edx/paragon';

const StatefulEnroll = () => {
  const [enrollButtonState, setEnrollButtonState] = useState('default');
  const enrollButtonLabels = {
    default: 'Enroll',
    pending: 'Enrolling...',
    complete: 'Enrolled',
    error: 'Try again',
  };

  const handleEnrollButtonClick = () => {};

  return (
    <StatefulButton
      labels={enrollButtonLabels}
      state={enrollButtonState}
      onClick={handleEnrollButtonClick}
    />
  );
};

export default StatefulEnroll;
