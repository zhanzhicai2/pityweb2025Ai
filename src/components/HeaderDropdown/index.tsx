import { Dropdown } from 'antd';
import type { DropDownProps } from 'antd/es/dropdown';
import React from 'react';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import classNames from 'classnames';

export type HeaderDropdownProps = {
  overlayClassName?: string;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
} & DropDownProps;

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  overlayClassName: cls,
  overlay,
  ...restProps
}) => {
  const className = useEmotionCss(({ token }) => {
    return {
      [`@media screen and (max-width: ${token.screenXS})`]: {
        width: '100%',
      },
    };
  });

  // antd v5 Dropdown overlay 已废弃，这里做兼容处理
  // 如果传了 overlay，转换为 menu.children 格式
  const dropdownProps = overlay
    ? { menu: { children: overlay as React.ReactNode } as DropDownProps['menu'], ...restProps }
    : restProps;

  return (
    <Dropdown
      overlayClassName={classNames(className, cls)}
      getPopupContainer={(target) => target.parentElement || document.body}
      {...dropdownProps}
    />
  );
};

export default HeaderDropdown;
