import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Dropdown } from 'antd';
import type { DropDownProps } from 'antd/es/dropdown';
import classNames from 'classnames';
import React from 'react';

export type HeaderDropdownProps = {
  overlayClassName?: string;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & Omit<DropDownProps, 'overlay'>;

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  overlayClassName: cls,
  open,
  onOpenChange,
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
      getPopupContainer={(target) => target.parentElement || document.body}
      open={open}
      onOpenChange={onOpenChange}
      {...restProps}
    />
  );
};

export default HeaderDropdown;
