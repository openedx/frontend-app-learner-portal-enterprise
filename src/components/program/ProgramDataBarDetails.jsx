import React, {
  useContext, useRef, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { ProgramContext } from './ProgramContextProvider';
import { appendProgramToProgramType } from './data/utils';

const ProgramDataBarDetails = ({ handleStick, handleRelease }) => {
  const {
    program: {
      title, authoringOrganizations: owners, type,
    },
  } = useContext(ProgramContext);

  const wrapper = useRef(null);
  const [sticky, setSticky] = useState(false);
  const [componentTop, setComponentTop] = useState(0);

  const getOffsetTop = () => {
    if (wrapper?.current) {
      const rect = wrapper.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      return rect.top + scrollTop;
    }

    return 1;
  };

  const handleScroll = () => {
    const windowPosition = window.scrollY;
    const wrapperTop = getOffsetTop();
    if (!sticky) {
      if (windowPosition >= wrapperTop) {
        setSticky(() => true);
        setComponentTop(() => wrapperTop);
        handleStick();
      }
    }
    if (windowPosition === 0 || (windowPosition + 30) < componentTop) {
      setSticky(() => false);
      handleRelease();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [componentTop, sticky]);

  const partnerList = owners.map(owner => owner.key).join(',');
  return (
    <div ref={wrapper} className="program">
      <div className="type">
        {appendProgramToProgramType(type)} in <div className="title">{title}</div>
      </div>
      <div className="institution">{partnerList}</div>
    </div>
  );
};

ProgramDataBarDetails.propTypes = {
  handleStick: PropTypes.func.isRequired,
  handleRelease: PropTypes.func.isRequired,
};

export default ProgramDataBarDetails;
