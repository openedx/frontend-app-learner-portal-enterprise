import React, { useContext } from 'react';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';
import { ProgramContext } from './ProgramContextProvider';

const ProgramEndorsements = () => {
  const { program: { corporateEndorsements } } = useContext(ProgramContext);
  const formatAuthorFullName = endorser => `${endorser.givenName} ${endorser.familyName}`;
  const title = endorser => (endorser.position ? endorser.position.title : '');

  return ((corporateEndorsements?.length > 0)
      && (corporateEndorsements.some((e) => e.individualEndorsements?.length > 0)))
    ? (
      <div className="endorsements p-2 mb-3">
        <h2 className="program-section-heading">Program endorsements</h2>
        <MediaQuery minWidth={breakpoints.medium.minWidth}>
          {matches => matches && (
            <div className="quote-icon-wrapper">
              <FontAwesomeIcon icon={faQuoteLeft} className="quote-icon" size="2x" />
            </div>
          )}
        </MediaQuery>

        <div className="row">
          {
            corporateEndorsements.map(({
              corporationName: corporation,
              image,
              individualEndorsements: endorsements,
            }) => {
              const { endorser, quote } = endorsements[0];
              return (endorser && quote) ? (
                <div className="d-flex callout-wrapper col-12 col-lg-6" key={formatAuthorFullName(endorsements[0].endorser)}>
                  <div className="content">
                    {image && (
                      <div className="company-endorser-logo-wrapper">
                        <img src={image.src} alt={corporation} className="company-endorser-logo" />
                      </div>
                    )}
                    {!image && <h3 className="h3">{corporation}</h3>}
                    <p className="endorsement">{endorsements[0].quote}</p>
                    <div className="attribution d-flex align-items-center">
                      <div
                        className="attribution-label"
                      >{formatAuthorFullName(endorsements[0].endorser)} {title(endorsements[0].endorser).length > 0 && `, ${title(endorsements[0].endorser)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })
          }
        </div>
      </div>
    ) : null;
};

export default ProgramEndorsements;
