import { StatusAlert } from '@edx/paragon';
import React, { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchMinus } from '@fortawesome/free-solid-svg-icons';

const CatalogNoResults = () => {
  const renderDialog = useCallback(
    () => (
      <div className="lead d-flex align-items-center justify-content-center py-3">
        <div className="mr-3">
          <FontAwesomeIcon icon={faSearchMinus} size="2x" />
        </div>
        <div>
          Nothing to show in here
        </div>
      </div>
    ),
    [],
  );
  return (
    <>
      <StatusAlert
        className="mb-5"
        alertType="info"
        dialog={renderDialog()}
        dismissible={false}
        open
      />
    </>
  );
};

export default CatalogNoResults;
