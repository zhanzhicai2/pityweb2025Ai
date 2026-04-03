import { Button } from 'antd';
import { CSSProperties, ReactNode, useState } from 'react';

interface LoadingButtonProps {
  text?: ReactNode;
  style?: CSSProperties;
  icon?: ReactNode;
  onClick: (value?: any) => Promise<void>;
}

export default ({ text, style, icon, onClick }: LoadingButtonProps) => {
  const [loading, setLoading] = useState(false);

  const click = async (value?: any) => {
    setLoading(true);
    await onClick(value);
    setLoading(false);
  };

  return (
    <Button onClick={click} style={style} loading={loading}>
      {icon} {text}
    </Button>
  );
};
