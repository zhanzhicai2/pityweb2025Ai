import { Tooltip } from 'antd';
import { CSSProperties, ReactNode } from 'react';

interface TooltipIconProps {
  icon: ReactNode;
  title?: string;
  font?: string | number;
  style?: CSSProperties;
  onClick?: () => void;
}

export default ({ icon, title, font, style, onClick }: TooltipIconProps) => {
  return (
    <Tooltip title={title}>
      <span onClick={onClick} style={{ cursor: 'pointer', fontSize: font, ...style }}>
        {icon}
      </span>
    </Tooltip>
  );
};
