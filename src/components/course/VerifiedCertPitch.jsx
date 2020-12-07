import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoad, faRocket } from '@fortawesome/free-solid-svg-icons';

import './styles/VerifiedCertPitch.scss';

function VerifiedCertPitchIcon({ icon }) {
  return (
    <div className="icon d-flex bg-info mr-3 p-2 align-items-center justify-content-center">
      <FontAwesomeIcon className="text-white" icon={icon} />
    </div>
  );
}

VerifiedCertPitchIcon.propTypes = {
  icon: PropTypes.shape({}).isRequired,
};

export default function VerifiedCertPitch() {
  return (
    <div className="verified-cert-pitch mb-5">
      <h3 className="mb-4">
        Pursue a Verified Certificate to highlight the knowledge and skills you gain
      </h3>
      <ul className="pl-0 mb-0 list-unstyled">
        <li className="d-flex mb-4">
          <VerifiedCertPitchIcon icon={faRocket} />
          <div>
            <h4>Official and Verified</h4>
            <span>
              Receive an instructor-signed certificate with the institution&apos;s
              logo to verify your achievement.
            </span>
          </div>
        </li>
        <li className="d-flex mb-4">
          <VerifiedCertPitchIcon icon={faRoad} />
          <div>
            <h4>Easily Shareable</h4>
            <span>
              Add the certificate to your CV or resume, or post it
              directly on LinkedIn.
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
}
