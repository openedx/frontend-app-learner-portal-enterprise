import { Link } from 'react-router-dom';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { getProgramIcon, formatProgramType } from './data/utils';
import { features } from '../../config';
import { useCourseMetadata, useEnterpriseCustomer } from '../app/data';

const CourseAssociatedPrograms = () => {
  const { data: courseMetadata } = useCourseMetadata();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return (
    <div className="associated-programs mb-5">
      <h3>
        <FormattedMessage
          id="enterprise.course.about.course.sidebar.associated.programs"
          defaultMessage="Associated Programs"
          description="Title for the section that lists the programs that are associated with the course."
        />
      </h3>
      <ul className="pl-0 list-unstyled">
        {courseMetadata.programs.map(program => (
          <li key={program.uuid} className="mb-3 row">
            <div className="col d-flex">
              <div className="program-icon" aria-hidden="true">
                <img
                  src={getProgramIcon(program.type)}
                  alt={program.title}
                  className="program-icon mr-2"
                  style={{ width: 20, height: 20 }}
                />
              </div>
              <div>
                {formatProgramType(program.type)}
              </div>
            </div>
            <div className="col">
              <Link
                to={features.ENABLE_PROGRAMS
                  ? `/${enterpriseCustomer.slug}/program/${program.uuid}`
                  : program.marketingUrl}
                onClick={() => {
                  sendEnterpriseTrackEvent(
                    enterpriseCustomer.uuid,
                    'edx.ui.enterprise.learner_portal.course.sidebar.program.clicked',
                    {
                      program_title: program.title,
                      program_type: program.type,
                    },
                  );
                }}
              >
                {program.title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseAssociatedPrograms;
