import { connect } from '@umijs/max';
import { AutoComplete } from 'antd';
import React, { useEffect } from 'react';

interface GConfigInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string;
  gconfig?: {
    options: { label: React.ReactNode; value: string }[];
  };
  dispatch?: (action: any) => void;
}

const GConfigInput: React.FC<GConfigInputProps> = ({
  placeholder,
  onChange,
  value,
  gconfig,
  dispatch,
}) => {
  const { options } = gconfig || {};

  useEffect(() => {
    dispatch?.({
      type: 'gconfig/fetchAllGConfig',
      payload: {},
    });
  }, [dispatch]);

  return (
    <AutoComplete placeholder={placeholder} onChange={onChange} value={value} options={options} />
  );
};

export default connect(({ gconfig }: { gconfig: any }) => ({
  gconfig: gconfig,
}))(GConfigInput as any) as any;
