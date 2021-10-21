import { useContext } from 'react';
import { Collapsible } from '@edx/paragon';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ProgramContext } from './ProgramContextProvider';

function ProgramFAQ() {
  const { program: { faq } } = useContext(ProgramContext);
  return faq?.length > 0
    ? (
      <div className="col-lg-8 p-2 mb-3">
        <h2 className="program-section-heading">FAQs</h2>
        <div className="faq mb-4">
          {
            faq.map((q) => (
              <Collapsible
                styling="card-lg"
                className="collapsible shadow-lg"
                title={q.question}
                key={q.question}
                iconWhenOpen={<FontAwesomeIcon className="text-primary text-lg" icon={faChevronUp} size="1x" />}
                iconWhenClosed={<FontAwesomeIcon className="text-primary" icon={faChevronDown} size="1x" />}
              >
                {q.answer}
              </Collapsible>
            ))
          }
        </div>
      </div>
    ) : null;
}

export default ProgramFAQ;
