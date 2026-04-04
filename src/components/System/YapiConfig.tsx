import CONFIG from '@/consts/config';
import { Col, Form, Input, Row } from 'antd';
import React from 'react';

interface YapiConfigProps {
  form: any;
}

const YapiConfig: React.FC<YapiConfigProps> = ({ form }) => {
  return (
    <Row gutter={8}>
      <Col span={4} />
      <Col span={16}>
        <Form form={form} {...CONFIG.LAYOUT}>
          <Form.Item label="token" name="token">
            <Input placeholder="请输入yapi token" />
          </Form.Item>
        </Form>
      </Col>
      <Col span={4} />
    </Row>
  );
};

export default YapiConfig;
