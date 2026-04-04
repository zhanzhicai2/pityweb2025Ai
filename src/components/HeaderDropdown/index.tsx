import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Dropdown } from 'antd';
import type { DropDownProps } from 'antd/es/dropdown';
import classNames from 'classnames';
import React from 'react';

export type HeaderDropdownProps = {
  overlayClassName?: string;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
  overlay?: React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
} & Omit<DropDownProps, 'overlay'>;

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  overlayClassName: cls,
  overlay,
  onVisibleChange,
  ...restProps
}) => {
  const className = useEmotionCss(({ token }) => {
    return {
      [`@media screen and (max-width: ${token.screenXS})`]: {
        width: '100%',
      },
    };
  });
  return (
    <Dropdown
      overlayClassName={classNames(className, cls)}
      trigger={['click']}
      onOpenChange={onVisibleChange}
      getPopupContainer={(target) => target.parentElement || document.body}
      {...restProps}
    >
      {overlay}
    </Dropdown>
  );
};

export default HeaderDropdown;
