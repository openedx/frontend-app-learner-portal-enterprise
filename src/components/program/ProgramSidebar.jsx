import React, { useContext } from 'react';
import {
  faBook, faUser, faClock, faTachometerAlt,
} from '@fortawesome/free-solid-svg-icons';
import ProgramSidebarListItem from './ProgramSidebarListItem';
import { ProgramContext } from './ProgramContextProvider';
import {
  getProgramPacing,
  getProgramPacingTypeContent,
  getExpertInstructionSecondaryContent,
  getProgramDuration,
  getTotalEstimatedEffortInHoursPerWeek,
  getVerboseProgramPacing,
} from './data/utils';

function ProgramSidebar() {
  const { program } = useContext(ProgramContext);
  const expertInstructionSecondaryContent = getExpertInstructionSecondaryContent(program);
  const programPacingType = getProgramPacing(program);
  const verboseProgramPacingType = getVerboseProgramPacing(programPacingType);
  const programPacingTypeContent = getProgramPacingTypeContent(programPacingType);
  const programDuration = getProgramDuration(program);
  const totalEstimatedEffortInHoursPerWeek = getTotalEstimatedEffortInHoursPerWeek(program);

  return (
    <ul className="pl-0 mb-5 program-details-sidebar">
      <ProgramSidebarListItem
        icon={faBook}
        label="Expert instruction"
        content={expertInstructionSecondaryContent}
      />

      {
        verboseProgramPacingType && programPacingTypeContent && (
          <ProgramSidebarListItem
            icon={faUser}
            label={verboseProgramPacingType}
            content={programPacingTypeContent}
          />
        )
      }
      {
        programDuration && (
          <ProgramSidebarListItem
            icon={faClock}
            label="Length"
            content={programDuration}
          />
        )
      }
      {
        totalEstimatedEffortInHoursPerWeek && (
          <ProgramSidebarListItem
            icon={faTachometerAlt}
            label="Effort"
            content={totalEstimatedEffortInHoursPerWeek}
          />
        )
      }
    </ul>
  );
}

export default ProgramSidebar;
