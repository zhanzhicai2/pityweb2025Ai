import { Col, Form, FormItem, Modal } from 'antd';
import React, { useEffect } from 'react';
import getComponent from './index';

interface Field {
  span?: number;
  label?: string;
  colon?: boolean;
  required?: boolean;
  message?: string;
  name?: string;
  valuePropName?: string;
  placeholder?: string;
  component?: React.ReactNode;
}

interface FormForModalProps {
  title?: string;
  width?: number;
  left?: number;
  right?: number;
  formName?: string;
  record?: any;
  onFinish?: (values: any) => void;
  loading?: boolean;
  fields?: Field[];
  open?: boolean;
  onCancel?: () => void;
  offset?: number;
  children?: React.ReactNode;
  Footer?: React.ComponentType<any>;
  onTest?: (values: any) => void;
}

const FormForModal: React.FC<FormForModalProps> = ({
  title,
  width,
  left = 5,
  right = 19,
  formName,
  record,
  onFinish,
  loading,
  fields,
  open,
  onCancel,
  offset = 0,
  children,
  Footer,
  onTest,
}) => {
  const [form] = Form.useForm();

  const onOk = () => {
    form.validateFields().then((values) => {
      onFinish?.(values);
    });
  };

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(record);
  }, [record, form]);

  const layout = {
    labelCol: { span: left },
    wrapperCol: { span: right },
  };

  return (
    <Modal
      style={{ marginTop: offset }}
      confirmLoading={loading}
      footer={
        Footer !== undefined ? (
          <Footer
            onOk={onOk}
            onCancel={onCancel}
            onTest={() => {
              form.validateFields().then((values) => {
                onTest?.(values);
              });
            }}
          />
        ) : undefined
      }
      title={title}
      width={width}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
    >
      {children || null}
      <Form form={form} {...layout} name={formName} initialValues={record} onFinish={onFinish}>
        {fields?.map((item, index) => (
          <Col span={item.span || 24} key={index}>
            <FormItem
              label={item.label}
              colon={item.colon || true}
              initialValue={item.valuePropName}
              rules={[{ required: item.required, message: item.message }]}
              name={item.name}
              valuePropName={item.valuePropName || 'value'}
            >
              {getComponent(item.type || 'input', item.placeholder, item.component)}
            </FormItem>
          </Col>
        ))}
      </Form>
    </Modal>
  );
};

export default FormForModal;
