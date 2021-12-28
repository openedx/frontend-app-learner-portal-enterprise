import { render } from '@testing-library/react';
import * as programUtils from '../utils';
import { PROGRAM_TYPE_MAP, PROGRAM_PACING_MAP, PACING_TYPE_CONTENT } from '../constants';
import { appendProgramToProgramType } from '../utils';

const program = {
  courses: [
    {
      activeCourseRun: {
        pacingType: PROGRAM_PACING_MAP.SELF_PACED,
      },
    },
    {
      activeCourseRun: {
        pacingType: PROGRAM_PACING_MAP.SELF_PACED,
      },
    },
  ],
  type: PROGRAM_TYPE_MAP.MICROMASTERS,
  weeksToComplete: 3,
};

describe('getProgramPacing', () => {
  it('when courses have same pacing type', () => {
    const programPacingType = programUtils.getProgramPacing(program);
    expect(programPacingType).toEqual(PROGRAM_PACING_MAP.SELF_PACED);
  });

  it('when courses have different pacing type', () => {
    const programWithDifferentPacingType = program;
    programWithDifferentPacingType.courses[0].activeCourseRun.pacingType = PROGRAM_PACING_MAP.INSTRUCTOR_PACED;
    const programPacingType = programUtils.getProgramPacing(programWithDifferentPacingType);
    expect(programPacingType).toEqual(PROGRAM_PACING_MAP.MIXED);
  });

  it('when courses have no active course runs', () => {
    const programWithNoActiveCourseRun = {
      ...program,
      courses: [{
        activeCourseRun: undefined,
      }],
    };
    const programPacingType = programUtils.getProgramPacing(programWithNoActiveCourseRun);
    expect(programPacingType).toBeFalsy();
  });
});

describe('getProgramPacingTypeContent', () => {
  it('when pacing type is self paced', () => {
    const pacingTypeContent = programUtils.getProgramPacingTypeContent(PROGRAM_PACING_MAP.SELF_PACED);
    const expected = PACING_TYPE_CONTENT.SELF_PACED;
    expect(pacingTypeContent).toEqual(expected);
  });

  it('when pacing type is instructor paced', () => {
    const pacingTypeContent = programUtils.getProgramPacingTypeContent(PROGRAM_PACING_MAP.INSTRUCTOR_PACED);
    const expected = PACING_TYPE_CONTENT.INSTRUCTOR_PACED;
    expect(pacingTypeContent).toEqual(expected);
  });
});

describe('programIsMicroMasters', () => {
  it('when program type is MicroMasters', () => {
    const programIsMicroMasters = programUtils.programIsMicroMasters(program);
    expect(programIsMicroMasters).toBeTruthy();
  });

  it('when program type is other than MicroMasters', () => {
    const programWithDifferentType = {
      ...program,
      type: PROGRAM_TYPE_MAP.CREDIT,
    };
    const programIsMicroMasters = programUtils.programIsMicroMasters(programWithDifferentType);
    expect(programIsMicroMasters).toBeFalsy();
  });
});

describe('programIsProfessionalCertificate', () => {
  it('when program type is Professional Certificate', () => {
    const programWithProfCertType = {
      ...program,
      type: PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE,
    };
    const programIsProfessionalCertificate = programUtils.programIsProfessionalCertificate(programWithProfCertType);
    expect(programIsProfessionalCertificate).toBeTruthy();
  });

  it('when program type is other than Professional Certificate', () => {
    const programIsProfessionalCertificate = programUtils.programIsProfessionalCertificate(program);
    expect(programIsProfessionalCertificate).toBeFalsy();
  });
});

describe('getExpertInstructionSecondaryContent', () => {
  it('when program type is MicroMasters', () => {
    const expInstSecondaryContent = programUtils.getExpertInstructionSecondaryContent(program);
    const courseCount = program.courses.length;
    expect(expInstSecondaryContent).toEqual(`${courseCount} graduate-level courses`);
  });

  it('when program type is Professional Certificate', () => {
    const programWithProfCertType = {
      ...program,
      type: PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE,
    };
    const expInstSecondaryContent = programUtils.getExpertInstructionSecondaryContent(programWithProfCertType);
    const courseCount = program.courses.length;
    expect(expInstSecondaryContent).toEqual(`${courseCount} skill-building courses`);
  });

  it('when there is any other program type', () => {
    const programWithOtherType = {
      ...program,
      type: PROGRAM_TYPE_MAP.CREDIT,
    };
    const expInstSecondaryContent = programUtils.getExpertInstructionSecondaryContent(programWithOtherType);
    const courseCount = program.courses.length;
    expect(expInstSecondaryContent).toEqual(`${courseCount} high-quality courses`);
  });
});

describe('getTotalWeeks', () => {
  it('when program contains weeks to complete info', () => {
    const totalWeeks = programUtils.getTotalWeeks(program);
    expect(totalWeeks).toEqual(program.weeksToComplete);
  });

  it('when program contains min and max weeks to complete info', () => {
    const MIN = 5;
    const MAX = 7;
    const programWithMinMaxWeekInfo = {
      ...program,
      weeksToComplete: null,
      weeksToCompleteMin: MIN,
      weeksToCompleteMax: MAX,
    };
    const totalWeeks = programUtils.getTotalWeeks(programWithMinMaxWeekInfo);
    const expected = Math.round((MIN + MAX) / 2);
    expect(totalWeeks).toEqual(expected);
  });

  it('when program does not contain weeks to complete info', () => {
    const programWithNoInfo = {
      ...program,
      weeksToComplete: null,
      weeksToCompleteMin: null,
      weeksToCompleteMax: null,
    };
    const totalWeeks = programUtils.getTotalWeeks(programWithNoInfo);
    expect(totalWeeks).toBeFalsy();
  });
});

describe('getTotalEstimatedEffortInHoursPerWeek', () => {
  it('when min and max effort hours per week are not available', () => {
    const estimatedEffortPerWeek = programUtils.getTotalEstimatedEffortInHoursPerWeek(program);
    expect(estimatedEffortPerWeek).toBeFalsy();
  });

  it('when min and max effort hours per week are available but equal', () => {
    const MIN = 7;
    const MAX = 7;
    const programWithMinMaxEffortWeekInfo = {
      ...program,
      minHoursEffortPerWeek: MIN,
      maxHoursEffortPerWeek: MAX,
    };
    const estimatedEffort = programUtils.getTotalEstimatedEffortInHoursPerWeek(programWithMinMaxEffortWeekInfo);
    expect(estimatedEffort).toEqual(`${MIN} hours per week`);
  });

  it('when min and max effort hours per week are available and not equal', () => {
    const MIN = 5;
    const MAX = 7;
    const programWithMinMaxEffortWeekInfo = {
      ...program,
      minHoursEffortPerWeek: MIN,
      maxHoursEffortPerWeek: MAX,
    };
    const estimatedEffort = programUtils.getTotalEstimatedEffortInHoursPerWeek(programWithMinMaxEffortWeekInfo);
    expect(estimatedEffort).toEqual(`${MIN} - ${MAX} hours per week`);
  });
});

describe('getProgramDuration', () => {
  it('when program does not contain weeks to complete info', () => {
    const programWithNoInfo = {
      ...program,
      weeksToComplete: null,
      weeksToCompleteMin: null,
      weeksToCompleteMax: null,
    };
    const programDuration = programUtils.getProgramDuration(programWithNoInfo);
    expect(programDuration).toBeFalsy();
  });

  it('when weeks to complete are less than a month', () => {
    // with 3 weeks
    let programDuration = programUtils.getProgramDuration(program);
    expect(programDuration).toEqual(`${program.weeksToComplete} weeks`);

    // with 1 week
    const progWithOneWeekDuration = {
      ...program,
      weeksToComplete: 1,
    };
    programDuration = programUtils.getProgramDuration(progWithOneWeekDuration);
    expect(programDuration).toEqual(`${progWithOneWeekDuration.weeksToComplete} week`);
  });

  it('when weeks to complete are more than a month but less than a year', () => {
    // with 5 weeks
    let totalWeeks = 5;
    let progWithOneWeekDuration = {
      ...program,
      weeksToComplete: totalWeeks,
    };
    let expectedDuration = `${Math.round(totalWeeks / 4)} month`;
    let programDuration = programUtils.getProgramDuration(progWithOneWeekDuration);
    expect(programDuration).toEqual(expectedDuration);

    // with 10 weeks
    totalWeeks = 10;
    progWithOneWeekDuration = {
      ...program,
      weeksToComplete: totalWeeks,
    };
    expectedDuration = `${Math.round(totalWeeks / 4)} months`;
    programDuration = programUtils.getProgramDuration(progWithOneWeekDuration);
    expect(programDuration).toEqual(expectedDuration);
  });

  it('when weeks to complete are more than a year', () => {
    // with 49 weeks; approx. 1 year
    let totalWeeks = 49;
    let progWithOneWeekDuration = {
      ...program,
      weeksToComplete: totalWeeks,
    };
    let programDuration = programUtils.getProgramDuration(progWithOneWeekDuration);
    expect(programDuration).toEqual('1 year');

    // with 96 weeks; approx. 2 years
    totalWeeks = 96;
    progWithOneWeekDuration = {
      ...program,
      weeksToComplete: totalWeeks,
    };
    programDuration = programUtils.getProgramDuration(progWithOneWeekDuration);
    expect(programDuration).toEqual('2 years');

    // with 70 weeks; approx. 1.5 year
    totalWeeks = 70;
    progWithOneWeekDuration = {
      ...program,
      weeksToComplete: totalWeeks,
    };
    programDuration = programUtils.getProgramDuration(progWithOneWeekDuration);
    expect(programDuration).toEqual('1 year 6 months');

    // with 52 weeks; approx. 1 year, 1 month
    totalWeeks = 52;
    progWithOneWeekDuration = {
      ...program,
      weeksToComplete: totalWeeks,
    };
    programDuration = programUtils.getProgramDuration(progWithOneWeekDuration);
    expect(programDuration).toEqual('1 year 1 month');

    // with 100 weeks; approx. 2 years, 1 month
    totalWeeks = 100;
    progWithOneWeekDuration = {
      ...program,
      weeksToComplete: totalWeeks,
    };
    programDuration = programUtils.getProgramDuration(progWithOneWeekDuration);
    expect(programDuration).toEqual('2 years 1 month');

    // with 104 weeks; approx. 2 years, 2 months
    totalWeeks = 104;
    progWithOneWeekDuration = {
      ...program,
      weeksToComplete: totalWeeks,
    };
    programDuration = programUtils.getProgramDuration(progWithOneWeekDuration);
    expect(programDuration).toEqual('2 years 2 months');
  });
});

describe('appendProgramToProgramType', () => {
  it('tests appendProgramToProgramType returns correct results for MicroMasters', () => {
    expect(render(appendProgramToProgramType('MicroMasters')).baseElement.outerHTML)
      .toBe('<body><div><span> MicroMasters<markup>®</markup> Program </span></div></body>');
  });

  it('tests appendProgramToProgramType returns correct results for xSeries', () => {
    expect(render(appendProgramToProgramType('xSeries')).baseElement.outerHTML)
      .toBe('<body><div><span> xSeries<markup>®</markup> Program </span></div></body>');
  });

  it('tests appendProgramToProgramType returns correct results for MicroBachelors', () => {
    expect(render(appendProgramToProgramType('MicroBachelors')).baseElement.outerHTML)
      .toBe('<body><div><span> MicroBachelors<markup>®</markup> Program </span></div></body>');
  });

  it('tests appendProgramToProgramType returns correct results for Masters', () => {
    expect(appendProgramToProgramType('Masters')).toBe('Master\'s Degree');
  });

  it('tests appendProgramToProgramType returns correct results for professional_certificate', () => {
    expect(appendProgramToProgramType('professional_certificate')).toBe('Professional Certificate');
  });

  it('tests appendProgramToProgramType returns correct results for others', () => {
    expect(appendProgramToProgramType('otherXYZ')).toBe('otherXYZ');
  });
});
