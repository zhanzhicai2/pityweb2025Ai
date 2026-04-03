import { Tooltip } from 'antd';
import { CSSProperties, ReactNode } from 'react';

interface TooltipTextIconProps {
  icon?: ReactNode;
  title?: string;
  font?: string | number;
  style?: CSSProperties;
  text?: ReactNode;
  onClick?: () => void;
}

export default ({ icon, title, font, style, text, onClick }: TooltipTextIconProps) => {
  return (
    <Tooltip title={title}>
      <span onClick={onClick} style={{ cursor: 'pointer', fontSize: font, ...style }}>
        {icon} {text}
      </span>
    </Tooltip>
  );
};
