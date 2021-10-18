import { PROGRAM_TYPE_MAP, PROGRAM_PACING_MAP } from './constants';

export function getProgramPacing(program) {
  const { courses } = program;
  const coursePacings = courses.map((course) => {
    if (course.activeCourseRun) {
      return course.activeCourseRun.pacingType;
    }
    return false;
  });

  // Set removes duplicates
  const uniquePacings = new Set(coursePacings);

  if (uniquePacings.size === 1) {
    return coursePacings[0];
  }

  return PROGRAM_PACING_MAP.MIXED;
}

export function programIsMicroMasters(program) {
  const { type } = program;
  return type === PROGRAM_TYPE_MAP.MICROMASTERS;
}

export function programIsProfessionalCertificate(program) {
  const { type } = program;
  return type === PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE;
}

export function getProgramPacingTypeContent(PacingType) {
  if (PacingType === PROGRAM_PACING_MAP.INSTRUCTOR_PACED) {
    return 'Assignments and exams have specific due dates';
  }
  if (PacingType === PROGRAM_PACING_MAP.SELF_PACED) {
    return 'Progress at your own speed';
  }
  return undefined;
}

export function getExpertInstructionSecondaryContent(program) {
  const { courses } = program;
  const courseCount = courses.length;
  if (programIsMicroMasters(program)) {
    return `${courseCount} graduate-level courses`;
  }
  if (programIsProfessionalCertificate(program)) {
    return `${courseCount} skill-building courses`;
  }
  return `${courseCount} high-quality courses`;
}

function getTotalWeeks(program) {
  const totalWeeks = program.weeksToComplete;
  if (totalWeeks !== null) {
    return totalWeeks;
  }
  if (program.weeksToCompleteMin !== null && program.weeksToCompleteMax !== null) {
    return Math.round((program.weeksToCompleteMin + program.weeksToCompleteMax) / 2);
  }
  return null;
}

export function getTotalEstimatedEffortInHoursPerWeek(program) {
  const minTotalHours = program.minHoursEffortPerWeek;
  const maxTotalHours = program.maxHoursEffortPerWeek;

  if (minTotalHours === null || maxTotalHours == null) {
    return null;
  }

  if (minTotalHours === maxTotalHours) {
    return `${minTotalHours} hours per week`;
  }
  return `${minTotalHours} - ${maxTotalHours} hours per week`;
}

export function getProgramDuration(program) {
  const totalWeeks = getTotalWeeks(program);
  if (totalWeeks === null) {
    return null;
  }

  if (totalWeeks < 4) {
    if (totalWeeks === 1) {
      return `${totalWeeks} week`;
    }
    return `${totalWeeks} weeks`;
  }

  const totalMonths = Math.round(totalWeeks / 4);
  if (totalMonths < 12) {
    if (totalMonths === 1) {
      return `${totalMonths} month`;
    }
    return `${totalMonths} months`;
  }

  const totalYears = Math.floor(totalMonths / 12);
  const totalRemainderMonths = Math.round(totalMonths % 12);

  if (totalRemainderMonths === 0) {
    if (totalYears === 1) {
      return `${totalMonths} year`;
    }
    return `${totalMonths} years`;
  }
  if (totalYears === 1 && totalRemainderMonths === 1) {
    return '1 year 1 month';
  } if (totalYears === 1) {
    return `1 year ${totalRemainderMonths} months`;
  } if (totalRemainderMonths === 1) {
    return `${totalYears} years 1 month`;
  }

  return `${totalYears} years ${totalRemainderMonths} months`;
}
