import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { ContentPasteGo, RocketLaunch } from '@openedx/paragon/icons';

import './styles/VerifiedCertPitch.scss';

const VerifiedCertPitchIcon = ({ icon }) => (
  <div className="icon d-flex bg-info mr-3 p-2 align-items-center justify-content-center">
    <Icon className="text-white" src={icon} />
  </div>
);

VerifiedCertPitchIcon.propTypes = {
  icon: PropTypes.shape().isRequired,
};

const VerifiedCertPitch = () => (
  <div className="verified-cert-pitch mb-5">
    <h3 className="mb-4">
      Pursue a Verified Certificate to highlight the knowledge and skills you gain
    </h3>
    <ul className="pl-0 mb-0 list-unstyled">
      <li className="d-flex mb-4">
        <VerifiedCertPitchIcon icon={RocketLaunch} />
        <div>
          <h4>Official and Verified</h4>
          <span>
            Receive an instructor-signed certificate with the institution&apos;s
            logo to verify your achievement.
          </span>
        </div>
      </li>
      <li className="d-flex mb-4">
        <VerifiedCertPitchIcon icon={ContentPasteGo} />
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

export default VerifiedCertPitch;
