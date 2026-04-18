import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Modal } from 'antd';

export default function KnowledgeBaseForm({ visible, editingKB, onSave, onCancel }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingKB) {
        form.setFieldsValue({
          name: editingKB.name,
          description: editingKB.description,
          chunk_size: editingKB.chunk_size || 500,
          overlap: editingKB.overlap || 50,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingKB]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch {
      // 表单校验失败
    }
  };

  return (
    <Modal
      title={editingKB ? '编辑知识库' : '新建知识库'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="保存"
      cancelText="取消"
      width={520}
      destroyOnClose
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true, message: '请输入知识库名称' }, { max: 50 }]}
        >
          <Input placeholder="请输入知识库名称" />
        </Form.Item>
        <Form.Item label="描述" name="description" rules={[{ max: 200 }]}>
          <Input.TextArea rows={3} placeholder="请输入描述" />
        </Form.Item>
        <Form.Item
          label="分块大小"
          name="chunk_size"
          initialValue={500}
          rules={[{ required: true }]}
        >
          <InputNumber min={100} max={2000} step={100} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="重叠大小" name="overlap" initialValue={50} rules={[{ required: true }]}>
          <InputNumber min={0} max={500} step={10} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
