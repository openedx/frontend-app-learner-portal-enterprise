import MicroMastersProgramDetailsSvgIcon from '../../../assets/icons/micromasters-program-details.svg';
import ProfCertProgramDetailsSvgIcon from '../../../assets/icons/professional-certificate-program-details.svg';
import XSeriesProgramDetailsSvgIcon from '../../../assets/icons/xseries-program-details.svg';
import progCertMicroMaster from '../images/program-certificate-micromasters.gif';
import progCertProfessionalCert from '../images/program-certificate-professional-certificate.gif';
import progCertXSeries from '../images/program-certificate-xseries.gif';
import { PROGRAM_TYPE_MAP } from '../../program/data/constants';

export function getProgramIcon(type) {
  switch (type) {
    case PROGRAM_TYPE_MAP.XSERIES:
      return XSeriesProgramDetailsSvgIcon;
    case PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE:
      return ProfCertProgramDetailsSvgIcon;
    case PROGRAM_TYPE_MAP.MICROMASTERS:
      return MicroMastersProgramDetailsSvgIcon;
    default:
      return '#';
  }
}

export function getProgramCertImage(type) {
  switch (type) {
    case PROGRAM_TYPE_MAP.XSERIES:
      return progCertXSeries;
    case PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE:
      return progCertProfessionalCert;
    case PROGRAM_TYPE_MAP.MICROMASTERS:
      return progCertMicroMaster;
    default:
      return '#';
  }
}
