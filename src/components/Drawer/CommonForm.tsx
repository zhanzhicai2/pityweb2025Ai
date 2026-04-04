import { Button, Drawer, Form } from 'antd';
import React from 'react';

interface CommonFormProps {
  title?: string;
  width?: number;
  left?: number;
  right?: number;
  formName?: string;
  record?: any;
  onFinish?: (values: any) => void;
  loading?: boolean;
  fields?: any[];
  open?: boolean;
  onCancel?: () => void;
}

const CommonForm: React.FC<CommonFormProps> = ({
  title,
  width,
  left,
  right,
  formName,
  record,
  onFinish,
  loading,
  fields,
  open,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const onOk = () => {
    form.validateFields().then((values) => {
      onFinish?.({ ...values });
    });
  };

  const layout = {
    labelCol: { span: left || 6 },
    wrapperCol: { span: right || 18 },
  };

  return (
    <Drawer
      destroyOnClose
      loading={loading}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button
            onClick={() => {
              onCancel?.();
              form.resetFields();
            }}
            style={{ marginRight: 8 }}
          >
            取消
          </Button>
          <Button onClick={onOk} type="primary">
            提交
          </Button>
        </div>
      }
      title={title}
      width={width}
      open={open}
      onClose={() => {
        onCancel?.();
        form.resetFields();
      }}
    >
      <Form form={form} {...layout} name={formName} initialValues={record} onFinish={onFinish}>
        {fields?.map((item: any, index: number) => (
          <div key={index}>{item}</div>
        ))}
      </Form>
    </Drawer>
  );
};

export default CommonForm;
