import { Popconfirm } from 'antd';
import React from 'react';

interface PityPopConfirmProps {
  title?: string;
  text?: React.ReactNode;
  onConfirm?: () => void;
}

export default ({ title, text, onConfirm }: PityPopConfirmProps) => {
  return (
    <Popconfirm title={title} onConfirm={onConfirm}>
      <a>{text}</a>
    </Popconfirm>
  );
};
