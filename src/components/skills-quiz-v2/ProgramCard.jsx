import { Card, useMediaQuery, breakpoints } from '@edx/paragon';
import PropTypes from 'prop-types';

const ProgramCard = ({
  mainImg, logoImg, title, subtitle,
}) => {
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  return (
    <Card isClickable style={{ width: isExtraSmall ? '100%' : '40%' }}>
      <Card.ImageCap
        src={mainImg}
        srcAlt="Card image"
        logoSrc={logoImg}
        logoAlt="Card logo"
      />
      <Card.Header title={title} subtitle={subtitle} />
    </Card>
  );
};

ProgramCard.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  mainImg: PropTypes.string,
  logoImg: PropTypes.string,
};

ProgramCard.defaultProps = {
  title: null,
  subtitle: null,
  mainImg: null,
  logoImg: null,
};

export default ProgramCard;
