import { Drawer, Form, Input, Select, Button, Space, message, Divider } from 'antd';
import { useEffect, useState } from 'react';
import { createAITask, updateAITask } from '@/services/case_v2';
import auth from '@/utils/auth';

const { Option } = Select;
const { TextArea } = Input;

const AiTaskDrawer = ({ visible, record, onClose, onSuccess }) => {
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
          source: 'ai',
          status: 'pending',
        });
      }
    }
  }, [visible, record]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const api = isEdit ? updateAITask : createAITask;
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
      title={isEdit ? '编辑 AI 生成任务' : '新建 AI 生成任务'}
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
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="如：用户模块用例生成" />
        </Form.Item>

        <Form.Item
          name="project_id"
          label="所属项目"
          rules={[{ required: true, message: '请选择项目' }]}
        >
          <Select placeholder="请选择项目">
            {/* TODO: 从 project model 或 API 获取项目列表 */}
            <Option value={1}>默认项目</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="template_id"
          label="关联模板"
          rules={[{ required: true, message: '请选择模板' }]}
        >
          <Select placeholder="请选择模板">
            {/* TODO: 从模板列表 API 获取 */}
            <Option value={1}>API 测试模板</Option>
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

        <Divider>需求描述</Divider>

        <Form.Item
          name="requirement"
          label="需求描述"
          rules={[{ required: true, message: '请输入需求描述' }]}
        >
          <TextArea
            rows={6}
            placeholder="请详细描述需要生成的测试用例需求，例如：
1. 用户登录功能
2. 用户登出功能
3. 用户信息修改
...
支持自然语言描述，AI 将自动解析并生成测试用例"
          />
        </Form.Item>

        {isEdit && (
          <>
            <Divider>任务状态</Divider>

            <Form.Item name="status" label="状态">
              <Select>
                <Option value="pending">等待中</Option>
                <Option value="parsing">解析中</Option>
                <Option value="generating">生成中</Option>
                <Option value="completed">已完成</Option>
                <Option value="failed">失败</Option>
              </Select>
            </Form.Item>

            <Form.Item name="progress" label="进度">
              <Input disabled />
            </Form.Item>

            <Form.Item name="total_cases" label="计划生成数">
              <Input disabled />
            </Form.Item>

            <Form.Item name="generated_cases" label="已生成数">
              <Input disabled />
            </Form.Item>
          </>
        )}
      </Form>
    </Drawer>
  );
};

export default AiTaskDrawer;
