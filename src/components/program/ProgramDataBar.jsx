import React, { useContext, useState } from 'react';
import { Container } from '@edx/paragon';
import classNames from 'classnames';
import { Link } from 'react-scroll';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import { ProgramContext } from './ProgramContextProvider';
import ProgramDataBarDetails from './ProgramDataBarDetails';

const ProgramDataBar = () => {
  const [stuck, setStuck] = useState(false);
  const {
    program: { authoringOrganizations: owners, isBundled },
  } = useContext(ProgramContext);
  return (
    <div
      className={classNames('data-bar', 'shadow', { stuck })}
    >
      <div className={classNames('data-bar-content', `partner-count-${owners.length}`)}>
        <Container size="lg">
          <div className="row">
            <div className="partner-image-wrapper">
              {owners.map(({ logoImageUrl: imgUrl, name, key }) => (
                <div className="partner" key={key}>
                  <img src="https://prod-discovery.edx-cdn.org/organization/logos/2a73d2ce-c34a-4e08-8223-83bca9d2f01d-2cc8854c6fee.png" alt={name} className="partner-logo" />
                </div>
              ))}
            </div>
            <ProgramDataBarDetails
              handleStick={() => setStuck(true)}
              handleRelease={() => setStuck(false)}
            />
            <div className="cta-wrapper">
              <Link
                className="btn-of-interest"
                to="program-details-dropdown"
                href="#abcdef123"
                smooth
              >
                I'm interested
                <FontAwesomeIcon icon={faChevronCircleDown} className="icon ml-2 align-self-center" />
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};
export default ProgramDataBar;
