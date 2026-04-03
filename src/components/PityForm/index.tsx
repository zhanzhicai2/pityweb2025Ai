import { Input, Switch } from 'antd';
import React from 'react';

const { TextArea } = Input;

const getComponent = (type: string, placeholder?: string, component?: React.ReactNode) => {
  if (component) {
    return component;
  }
  if (type === 'input') {
    return <Input placeholder={placeholder} />;
  }
  if (type === 'textarea') {
    return <TextArea placeholder={placeholder} />;
  }
  if (type === 'switch') {
    return <Switch />;
  }
  return null;
};

export default getComponent;
