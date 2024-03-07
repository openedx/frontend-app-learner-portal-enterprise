import React, { useContext } from 'react';
import { Hyperlink } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { CourseContext } from './CourseContextProvider';
import { getProgramIcon, formatProgramType } from './data/utils';
import { features } from '../../config';
import { useEnterpriseCustomer } from '../hooks';

const CourseAssociatedPrograms = () => {
  const { state } = useContext(CourseContext);
  const { course } = state;
  const enterpriseCustomer = useEnterpriseCustomer();

  return (
    <div className="associated-programs mb-5">
      <h3>Associated Programs</h3>
      <ul className="pl-0 list-unstyled">
        {course.programs.map(program => (
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
              <Hyperlink
                destination={features.ENABLE_PROGRAMS ? `/${enterpriseCustomer.slug}/program/${program.uuid}`
                  : program.marketingUrl}
                target="_blank"
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
              </Hyperlink>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseAssociatedPrograms;
