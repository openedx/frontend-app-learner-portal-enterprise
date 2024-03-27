import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const ProgramPathwayOpportunity = ({ pathways, title, pathwayClass }) => (
  <div className={pathwayClass}>
    <h2 className="divider-heading"> { title } </h2>
    {pathways.map((pathway) => (
      <div key={uuidv4()} className="pathway-wrapper">
        <div className="pathway-info">
          <h2 className="pathway-heading"> { pathway.name } </h2>
          { pathway.description && <p> {pathway.description}</p> }
          { pathway.destinationUrl && (
            <div className="sidebar-button-wrapper">
              <a href={pathway.destinationUrl} className="pathway-link">
                <Button
                  variant="outline-primary"
                  className="btn pathway-button sidebar-button"
                  data-pathway-uuid={pathway.uuid}
                  data-pathway-name={pathway.name}
                >
                  <FormattedMessage
                    id="enterprise.dashboard.program.pathway.opportunity.learn.more"
                    defaultMessage="Learn more"
                    description="Label for the learn more button associated with a pathway opportunity on the programs about page. Clicking this button opens the pathway detail page."
                  />
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default ProgramPathwayOpportunity;

ProgramPathwayOpportunity.propTypes = {
  pathways: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    destinationUrl: PropTypes.string,
    uuid: PropTypes.string,
  })).isRequired,
  title: PropTypes.string.isRequired,
  pathwayClass: PropTypes.string.isRequired,
};
