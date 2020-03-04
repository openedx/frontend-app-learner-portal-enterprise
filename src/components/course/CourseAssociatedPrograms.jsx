import React, { useContext } from 'react';

import CourseContext from './CourseContext';

import MicroMastersSvgIcon from '../../assets/icons/micromasters.svg';
import ProfessionalSvgIcon from '../../assets/icons/professional.svg';
import VerifiedSvgIcon from '../../assets/icons/verified.svg';
import XSeriesSvgIcon from '../../assets/icons/xseries.svg';
import CreditSvgIcon from '../../assets/icons/credit.svg';

export default function CourseAssociatedPrograms() {
  const { course } = useContext(CourseContext);

  const formatProgramType = (programType) => {
    switch (programType.toLowerCase()) {
      case 'micromasters':
      case 'microbachelors':
        return <>{programType}<sup>&reg;</sup> Program</>;
      case 'masters':
        return 'Master\'s';
      default:
        return programType;
    }
  };

  const getProgramIcon = (type) => {
    switch (type) {
      case 'XSeries':
        return XSeriesSvgIcon;
      case 'Professional Certificate':
        return ProfessionalSvgIcon;
      case 'MicroMasters':
        return MicroMastersSvgIcon;
      case 'Credit':
        return CreditSvgIcon;
      default:
        return VerifiedSvgIcon;
    }
  };
  return (
    <div className="associated-programs mb-5">
      <h3>Associated Programs</h3>
      <ul className="pl-0" style={{ listStyleType: 'none' }}>
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
              <a
                href={`${process.env.MARKETING_SITE_URL}/${program.marketingUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {program.title}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
