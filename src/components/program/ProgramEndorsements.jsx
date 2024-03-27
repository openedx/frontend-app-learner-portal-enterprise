import { breakpoints, MediaQuery } from '@openedx/paragon';
import { FormatQuote } from '@openedx/paragon/icons';
import { useProgramDetails } from '../app/data';

const ProgramEndorsements = () => {
  const { data: program } = useProgramDetails();
  const { corporateEndorsements } = program;
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
              <FormatQuote className="quote-icon" height="48" width="48" />
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
                <div className="d-flex callout-wrapper col-12 col-lg-6" key={formatAuthorFullName(endorser)}>
                  <div className="content">
                    {image && (
                      <div className="company-endorser-logo-wrapper">
                        <img src={image.src} alt={corporation} className="company-endorser-logo" />
                      </div>
                    )}
                    {!image && <h3 className="h3">{corporation}</h3>}
                    <p className="endorsement">{quote}</p>
                    <div className="small d-flex align-items-center">
                      <div>
                        {formatAuthorFullName(endorser)} {title(endorser).length > 0 && `, ${title(endorser)}`}
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
