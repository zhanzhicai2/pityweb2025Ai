import { Drawer, Form, Input, InputNumber, message, Select, Space, Switch } from 'antd';
import React, { useEffect } from 'react';
import { createMockRule, updateMockRule } from '@/services/mock';
import auth from '@/utils/auth';

const { Option } = Select;
const { TextArea } = Input;

const MockDrawer = ({ visible, record, projects, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const isEdit = !!record?.id;

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        id: record.id,
        name: record.name,
        project_id: record.project_id,
        url_pattern: record.url_pattern,
        method: record.method,
        description: record.description,
        response_status: record.response_status,
        response_body: record.response_body,
        response_headers: record.response_headers,
        response_delay: record.response_delay,
        request_headers: record.request_headers,
        request_body_pattern: record.request_body_pattern,
        is_active: record.is_active,
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        response_status: 200,
        response_delay: 0,
        is_active: true,
        response_headers: '{}',
        request_headers: '{}',
      });
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const handler = isEdit ? updateMockRule : createMockRule;
      const res = await handler(values);
      if (auth.response(res)) {
        message.success(isEdit ? '更新成功' : '创建成功');
        onSuccess?.();
      }
    } catch (e) {
      message.error(e.message || '操作失败');
    }
  };

  return (
    <Drawer
      title={isEdit ? '编辑 Mock 规则' : '新增 Mock 规则'}
      open={visible}
      onClose={onClose}
      width={500}
      extra={
        <Space>
          <Switch checkedChildren="启用" unCheckedChildren="禁用" defaultChecked />
        </Space>
      }
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <button onClick={onClose} style={{ padding: '6px 16px' }}>
              取消
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: '6px 16px',
                background: '#1890ff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              确定
            </button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="规则名称"
          rules={[{ required: true, message: '请输入规则名称' }]}
        >
          <Input placeholder="获取用户信息" />
        </Form.Item>

        <Form.Item
          name="project_id"
          label="关联项目"
          rules={[{ required: true, message: '请选择项目' }]}
        >
          <Select placeholder="请选择项目" showSearch>
            {projects.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="url_pattern"
          label="URL 模式"
          rules={[{ required: true, message: '请输入 URL 模式' }]}
          extra="支持正则表达式，:id 会匹配任意数字或字符串"
        >
          <Input placeholder="/api/users/:id 或 ^/api/.*$" />
        </Form.Item>

        <Form.Item
          name="method"
          label="请求方法"
          rules={[{ required: true, message: '请选择请求方法' }]}
        >
          <Select placeholder="请选择请求方法">
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
            <Option value="PUT">PUT</Option>
            <Option value="DELETE">DELETE</Option>
            <Option value="PATCH">PATCH</Option>
          </Select>
        </Form.Item>

        <Form.Item name="description" label="描述">
          <TextArea rows={2} placeholder="根据用户ID获取用户信息的Mock规则" />
        </Form.Item>

        <Form.Item name="response_status" label="响应状态码" initialValue={200}>
          <InputNumber min={100} max={599} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="response_body"
          label="响应体"
          rules={[{ required: true, message: '请输入响应体' }]}
          extra="JSON 格式的响应数据"
        >
          <TextArea
            rows={6}
            placeholder={`{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 1001,
    "userName": "张三",
    "email": "zhangsan@example.com"
  }
}`}
          />
        </Form.Item>

        <Form.Item name="response_headers" label="响应头" initialValue="{}" extra="JSON 格式">
          <TextArea
            rows={2}
            placeholder={`{
  "Content-Type": "application/json",
  "X-Request-Id": "mock-123"
}`}
          />
        </Form.Item>

        <Form.Item
          name="response_delay"
          label="延迟 (ms)"
          initialValue={0}
          extra="模拟网络延迟，0 表示不延迟"
        >
          <InputNumber min={0} max={60000} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="request_headers"
          label="请求头条件"
          initialValue="{}"
          extra="JSON 格式，用于匹配特定请求头"
        >
          <TextArea
            rows={2}
            placeholder={`{
  "Authorization": "Bearer *",
  "Content-Type": "application/json"
}`}
          />
        </Form.Item>

        <Form.Item name="request_body_pattern" label="请求体正则" extra="可选，用于匹配请求体内容">
          <Input placeholder='如 ^{"userId":\\d+}$' />
        </Form.Item>

        <Form.Item name="is_active" label="是否启用" valuePropName="checked" initialValue={true}>
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default MockDrawer;
