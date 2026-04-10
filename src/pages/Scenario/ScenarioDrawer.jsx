import { Drawer, Form, Input, Select, Button, Space, message, Divider, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { createScenario, updateScenario } from '@/services/scenario';
import auth from '@/utils/auth';

const { Option } = Select;
const { TextArea } = Input;

const ScenarioDrawer = ({ visible, record, projects, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!record?.id;

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue(record);
      } else {
        form.resetFields();
        form.setFieldsValue({
          source: 'manual',
          is_active: 1,
          case_type: 'api',
        });
      }
    }
  }, [visible, record]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const api = isEdit ? updateScenario : createScenario;
      const res = await api(values);
      if (auth.response(res)) {
        message.success(isEdit ? '更新成功' : '创建成功');
        onSuccess?.();
      }
    } catch (e) {
      message.error(e.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={isEdit ? '编辑场景' : '新建场景'}
      width={500}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {isEdit ? '更新' : '创建'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="场景名称"
          rules={[{ required: true, message: '请输入场景名称' }]}
        >
          <Input placeholder="如：用户登录流程" />
        </Form.Item>

        <Form.Item
          name="project_id"
          label="所属项目"
          rules={[{ required: true, message: '请选择项目' }]}
        >
          <Select placeholder="请选择项目">
            {projects?.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="case_type"
          label="用例类型"
          rules={[{ required: true, message: '请选择用例类型' }]}
        >
          <Select>
            <Option value="api">API 测试</Option>
            <Option value="functional">功能测试</Option>
            <Option value="ui">UI 测试</Option>
          </Select>
        </Form.Item>

        <Form.Item name="description" label="场景描述">
          <TextArea rows={3} placeholder="描述这个场景的用途..." />
        </Form.Item>

        <Divider>全局变量</Divider>

        <Alert
          message="全局变量说明"
          description="定义场景级别的变量，格式：{key: value}，如设置 token，后续所有步骤都可引用"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item name="variables" label="全局变量（JSON）">
          <TextArea rows={3} placeholder='{"token": "", "baseUrl": "https://api.example.com"}' />
        </Form.Item>

        <Form.Item name="tags" label="标签">
          <Input placeholder="多个标签用逗号分隔" />
        </Form.Item>

        {isEdit && (
          <Form.Item name="is_active" label="状态">
            <Select>
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default ScenarioDrawer;
