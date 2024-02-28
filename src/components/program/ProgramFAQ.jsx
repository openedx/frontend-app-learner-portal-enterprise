import { useContext } from 'react';
import { Collapsible, Icon } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import { ProgramContext } from './ProgramContextProvider';

const ProgramFAQ = () => {
  const { program: { faq } } = useContext(ProgramContext);

  if (!faq || faq.length === 0) {
    return null;
  }

  return (
    <div className="program-faq col-lg-8 p-2 mb-3 mt-3">
      <h2 className="program-section-heading">FAQs</h2>
      <div className="faq mb-4">
        {faq.map((q) => (
          <Collapsible
            styling="card-lg"
            className="collapsible shadow-lg"
            title={q.question}
            key={q.question}
            iconWhenOpen={<Icon src={ExpandLess} />}
            iconWhenClosed={<Icon src={ExpandMore} />}
          >
            {q.answer}
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default ProgramFAQ;
