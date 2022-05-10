import { getProgramIcon } from '../utils';
import { PROGRAM_TYPE_MAP } from '../../../program/data/constants';
import MicroMastersProgramDetailsSvgIcon from '../../../../assets/icons/micromasters-program-details.svg';
import ProfCertProgramDetailsSvgIcon from '../../../../assets/icons/professional-certificate-program-details.svg';
import XSeriesProgramDetailsSvgIcon from '../../../../assets/icons/xseries-program-details.svg';

describe('getProgramIcon', () => {
  it('returns logo when program type is micromasters', () => {
    const icon = getProgramIcon(PROGRAM_TYPE_MAP.MICROMASTERS);
    expect(icon).toEqual(MicroMastersProgramDetailsSvgIcon);
  });

  it('returns logo when program type is xseries', () => {
    const icon = getProgramIcon(PROGRAM_TYPE_MAP.XSERIES);
    expect(icon).toEqual(XSeriesProgramDetailsSvgIcon);
  });

  it('returns logo when program type is professional certificate', () => {
    const icon = getProgramIcon(PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE);
    expect(icon).toEqual(ProfCertProgramDetailsSvgIcon);
  });

  it('returns empty string when program type is not from the PROGRAM_TYPE_MAP', () => {
    const icon = getProgramIcon('test');
    expect(icon).toEqual('');
  });
});
