import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

const { Option } = Select;

export default function RequirementForm({ visible, editingItem, onSave, onCancel }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (e) {
      console.error('表单验证失败', e);
    }
  };

  return (
    <Modal
      open={visible}
      title={editingItem ? '编辑需求文档' : '新建需求文档'}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={editingItem || {}}>
        <Form.Item
          name="name"
          label="文档名称"
          rules={[{ required: true, message: '请输入文档名称' }]}
        >
          <Input placeholder="请输入文档名称" />
        </Form.Item>

        <Form.Item
          name="doc_type"
          label="文档类型"
          rules={[{ required: true, message: '请选择文档类型' }]}
        >
          <Select placeholder="请选择文档类型">
            <Option value="PRD">PRD</Option>
            <Option value="需求文档">需求文档</Option>
            <Option value="技术方案">技术方案</Option>
            <Option value="测试用例">测试用例</Option>
            <Option value="其他">其他</Option>
          </Select>
        </Form.Item>

        <Form.Item name="content" label="文档描述">
          <Input.TextArea rows={4} placeholder="请输入文档描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
