import { render } from '@testing-library/react';
import * as programUtils from '../utils';
import { PROGRAM_TYPE_MAP, PROGRAM_PACING_MAP, PACING_TYPE_CONTENT } from '../constants';
import { appendProgramToProgramType } from '../utils';

const program = {
  courses: [
    {
      activeCourseRun: {
        pacingType: PROGRAM_PACING_MAP.SELF_PACED,
        weeksToComplete: 2,
      },
    },
    {
      activeCourseRun: {
        pacingType: PROGRAM_PACING_MAP.SELF_PACED,
        weeksToComplete: 5,
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
    expect(totalWeeks).toEqual(7);
  });

  it('when program courses does not contain weeks to complete info', () => {
    const programWithoutWeeksToComplete = {
      courses: [
        {
          activeCourseRun: {
            pacingType: PROGRAM_PACING_MAP.SELF_PACED,
            weeksToComplete: null,
          },
        },
        {
          activeCourseRun: {
            pacingType: PROGRAM_PACING_MAP.SELF_PACED,
            weeksToComplete: null,
          },
        },
      ],
      type: PROGRAM_TYPE_MAP.MICROMASTERS,
    };

    const totalWeeks = programUtils.getTotalWeeks(programWithoutWeeksToComplete);
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
    const programWithCustomWeeksToComplete = {
      courses: [
        {
          activeCourseRun: {
            weeksToComplete: null,
          },
        },
        {
          activeCourseRun: {
            weeksToComplete: null,
          },
        },
      ],
    };
    const programDuration = programUtils.getProgramDuration(programWithCustomWeeksToComplete);
    expect(programDuration).toBeFalsy();
  });

  it('when weeks to complete are less than a month', () => {
    // with 3 weeks
    const programWithCustomWeeksToComplete = {
      courses: [
        {
          activeCourseRun: {
            weeksToComplete: 2,
          },
        },
        {
          activeCourseRun: {
            weeksToComplete: 1,
          },
        },
      ],
    };
    const programDuration = programUtils.getProgramDuration(programWithCustomWeeksToComplete);
    expect(programDuration).toEqual(`${3} weeks`);
  });

  it('when weeks to complete are more than a month but less than a year', () => {
    // with 5 weeks
    const fiveWeeks = 5;
    const programWithFiveWeeksToComplete = {
      courses: [
        {
          activeCourseRun: {
            weeksToComplete: fiveWeeks,
          },
        },
        {
          activeCourseRun: {
            weeksToComplete: null,
          },
        },
      ],
    };

    let expectedDuration = `${Math.round(fiveWeeks / 4)} month`;
    let programDuration = programUtils.getProgramDuration(programWithFiveWeeksToComplete);
    expect(programDuration).toEqual(expectedDuration);

    // with 10 weeks
    const programWithTenWeeksToComplete = {
      courses: [
        {
          activeCourseRun: {
            weeksToComplete: fiveWeeks,
          },
        },
        {
          activeCourseRun: {
            weeksToComplete: fiveWeeks,
          },
        },
      ],
    };
    const tenWeeks = 10;
    expectedDuration = `${Math.round(tenWeeks / 4)} months`;
    programDuration = programUtils.getProgramDuration(programWithTenWeeksToComplete);
    expect(programDuration).toEqual(expectedDuration);
  });

  it('when weeks to complete are more than a year', () => {
    // with 49 weeks; approx. 1 year
    const fortyNineWeeks = 49;
    const programWithFortyNineWeeksToComplete = {
      courses: [
        {
          activeCourseRun: {
            weeksToComplete: fortyNineWeeks,
          },
        },
        {
          activeCourseRun: {
            weeksToComplete: null,
          },
        },
      ],
    };
    let programDuration = programUtils.getProgramDuration(programWithFortyNineWeeksToComplete);
    expect(programDuration).toEqual('1 year');

    const programWithFortyNineWeeksToCompleteInMultipleCourseRuns = {
      courses: [
        {
          activeCourseRun: {
            weeksToComplete: 10,
          },
        },
        {
          activeCourseRun: {
            weeksToComplete: 39,
          },
        },
      ],
    };
    programDuration = programUtils.getProgramDuration(programWithFortyNineWeeksToCompleteInMultipleCourseRuns);
    expect(programDuration).toEqual('1 year');

    // with 96 weeks; approx. 2 years
    const ninetySixWeeks = 96;
    const programWithNinetySixWeeksToComplete = {
      courses: [
        {
          activeCourseRun: {
            weeksToComplete: ninetySixWeeks,
          },
        },
        {
          activeCourseRun: {
            weeksToComplete: null,
          },
        },
      ],
    };
    programDuration = programUtils.getProgramDuration(programWithNinetySixWeeksToComplete);
    expect(programDuration).toEqual('2 years');

    // with 70 weeks; approx. 1.5 year
    const seventyWeeks = 70;
    const programWithSeventyWeeksToComplete = {
      courses: [
        {
          activeCourseRun: {
            weeksToComplete: seventyWeeks,
          },
        },
        {
          activeCourseRun: {
            weeksToComplete: null,
          },
        },
      ],
    };
    programDuration = programUtils.getProgramDuration(programWithSeventyWeeksToComplete);
    expect(programDuration).toEqual('1 year 6 months');

    // with 52 weeks; approx. 1 year, 1 month
    const threeWeeks = 3;
    const programWithFiftyTwoWeeksToComplete = {
      courses: [
        {
          activeCourseRun: {
            weeksToComplete: fortyNineWeeks,
          },
        },
        {
          activeCourseRun: {
            weeksToComplete: threeWeeks,
          },
        },
      ],
    };
    programDuration = programUtils.getProgramDuration(programWithFiftyTwoWeeksToComplete);
    expect(programDuration).toEqual('1 year 1 month');
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
