import { Col, Form, Row } from 'antd';
import { FormInstance } from 'antd/es/form';
import React, { useEffect } from 'react';

const { Item: FormItem } = Form;

interface Field {
  span?: number;
  label?: string;
  colon?: boolean;
  required?: boolean;
  message?: string;
  name?: string;
  valuePropName?: string;
  layout?: any;
  type?: string;
  placeholder?: string;
  component?: React.ReactNode;
}

interface CommonFormProps {
  left?: number;
  right?: number;
  formName?: string;
  record?: any;
  onFinish?: (values: any) => void;
  fields?: Field[];
  pForm?: FormInstance;
}

export default ({
  left = 5,
  right = 19,
  formName,
  record,
  onFinish,
  fields,
  pForm,
}: CommonFormProps) => {
  let currentForm = pForm;
  if (pForm === undefined) {
    const [form] = Form.useForm();
    currentForm = form;
  }
  const layout = {
    labelCol: { span: left },
    wrapperCol: { span: right },
  };

  useEffect(() => {
    currentForm?.setFieldsValue(record);
  }, [record, currentForm]);

  return (
    <Form form={currentForm} {...layout} name={formName} initialValues={record} onFinish={onFinish}>
      <Row gutter={8}>
        {fields?.map((item, index) => (
          <Col span={item.span || 24} key={index}>
            <FormItem
              label={item.label}
              colon={item.colon || true}
              rules={[{ required: item.required, message: item.message }]}
              name={item.name}
              valuePropName={item.valuePropName || 'value'}
              {...(item.layout || layout)}
            >
              {item.component}
            </FormItem>
          </Col>
        ))}
      </Row>
    </Form>
  );
};
