import React from 'react';
import { Alert } from '@edx/paragon';

export default () => {
  if (!process.env.SHOW_MAINTENANCE_ALERT) {
    return null;
  }

  return (
    <Alert variant="warning" className="mt-3 ml-3 mr-3 mb-0">
      edX Subscriptions and Codes will be unavailable due to planned maintenance on
      Tuesday, January 19th between 10am and 11:30am EST.
    </Alert>
  );
};
