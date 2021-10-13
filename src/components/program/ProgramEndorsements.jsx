import { useContext } from 'react';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ProgramContext } from './ProgramContextProvider';

const ProgramEndorsements = () => {
  const { program: { corporateEndorsements } } = useContext(ProgramContext);

  if (corporateEndorsements && corporateEndorsements.length > 0) {
    return (
      <div className="endorsements p-2">
        <h2 style={{ color: '#001b1e' }}>Program endorsements</h2>
        <div className="quote-icon-wrapper">
          <FontAwesomeIcon icon={faQuoteLeft} className="quote-icon" size="2x" />
        </div>
        <div className="row">
          {
            corporateEndorsements.map(({
              corporationName: corporation,
              image,
              individualEndorsements: endorsements,
            }) => {
              const { endorser: { givenName, familyName, position }, quote } = endorsements[0];
              const title = position ? position.title : '';
              const author = `${givenName} ${familyName}`;
              return (
                <div className="d-flex callout-wrapper col-12 col-lg-6" key={author}>
                  <div className="content">
                    {image && (
                      <div className="company-endorser-logo-wrapper">
                        <img src={image.src} alt={corporation} className="company-endorser-logo" />
                      </div>
                    )}
                    {!image && <h3 className="h3">{corporation}</h3>}
                    <p className="endorsement">{quote}</p>
                    <div className="attribution d-flex align-items-center">
                      <div
                        className="attribution-label"
                      >{author} {title.length > 0 && `, ${title}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
  return null;
};

export default ProgramEndorsements;
