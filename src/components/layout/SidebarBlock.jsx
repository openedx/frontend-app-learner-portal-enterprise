import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const SidebarBlock = ({
  className,
  title,
  children,
  titleOptions,
}) => {
  const { tag: TitleTag } = titleOptions;
  return (
    <div className={className}>
      {title && (
        <TitleTag className={classNames('mb-2', titleOptions.className)}>
          {title}
        </TitleTag>
      )}
      {children}
    </div>
  );
};

SidebarBlock.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
  titleOptions: PropTypes.shape({
    tag: PropTypes.string,
    className: PropTypes.string,
  }),
};

SidebarBlock.defaultProps = {
  title: null,
  className: undefined,
  titleOptions: { tag: 'h4', className: undefined },
};

export default SidebarBlock;
