import React, { useCallback, useContext, useState } from 'react';
import { Container } from '@openedx/paragon';
import { ExpandCircleDown } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { Link } from 'react-scroll';
import { ProgramContext } from './ProgramContextProvider';
import ProgramDataBarDetails from './ProgramDataBarDetails';

const ProgramDataBar = () => {
  const [stickProgramDataBar, setStickProgramDataBar] = useState(false);
  const {
    program: { authoringOrganizations: owners, isProgramEligibleForOneClickPurchase },
  } = useContext(ProgramContext);

  const handleStick = useCallback(() => setStickProgramDataBar(true), []);
  const handleRelease = useCallback(() => setStickProgramDataBar(false), []);

  return (
    <div
      className={classNames('data-bar', 'shadow', { stuck: stickProgramDataBar })}
    >
      <div className={classNames('data-bar-content', `partner-count-${owners.length}`)}>
        <Container size="lg">
          <div className="row">
            <div className="partner-image-wrapper">
              {owners.map(({ logoImageUrl: imgUrl, name, key }) => (
                <div className="partner" key={key}>
                  <img src={imgUrl} alt={name} className="partner-logo" />
                </div>
              ))}
            </div>
            <ProgramDataBarDetails
              handleStick={handleStick}
              handleRelease={handleRelease}
            />
            {isProgramEligibleForOneClickPurchase && (
              <div className="cta-wrapper">
                <Link
                  className="btn-of-interest"
                  to="program-details-dropdown"
                  smooth
                  spy
                  duration={750}
                  offset={-600}
                >
                  I&apos;m interested
                  <ExpandCircleDown className="icon ml-2 align-self-center" />
                </Link>
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};
export default ProgramDataBar;
