import React, { useContext } from 'react';
import {
  AccessTime, LibraryBooks, Person, Speed,
} from '@openedx/paragon/icons';
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

const ProgramSidebar = () => {
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
        icon={LibraryBooks}
        label="Expert instruction"
        content={expertInstructionSecondaryContent}
      />

      {
        verboseProgramPacingType && programPacingTypeContent && (
          <ProgramSidebarListItem
            icon={Person}
            label={verboseProgramPacingType}
            content={programPacingTypeContent}
          />
        )
      }
      {
        programDuration && (
          <ProgramSidebarListItem
            icon={AccessTime}
            label="Length"
            content={programDuration}
          />
        )
      }
      {
        totalEstimatedEffortInHoursPerWeek && (
          <ProgramSidebarListItem
            icon={Speed}
            label="Effort"
            content={totalEstimatedEffortInHoursPerWeek}
          />
        )
      }
    </ul>
  );
};

export default ProgramSidebar;
