import { listProject } from '@/services/project';
import {
  createDocument,
  deleteDocument,
  listDocuments,
  RequirementDocumentData,
  updateDocument,
} from '@/services/requirementDocument';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;

const docTypeOptions = [
  { label: 'PRD', value: 'prd' },
  { label: '需求文档', value: 'requirement' },
  { label: '设计文档', value: 'design' },
  { label: '其他', value: 'other' },
];

const getDocTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    prd: 'PRD',
    requirement: '需求文档',
    design: '设计文档',
    other: '其他',
  };
  return labels[type] || type;
};

const getDocTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    prd: 'blue',
    requirement: 'green',
    design: 'orange',
    other: 'default',
  };
  return colors[type] || 'default';
};

const RequirementPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<RequirementDocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState<RequirementDocumentData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [, setFileList] = useState<any[]>([]);
  const [projectList, setProjectList] = useState<any[]>([]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await listDocuments();
      if (res.code === 0) {
        setDataSource(res.data || []);
      } else {
        message.error(res.msg || '加载文档列表失败');
      }
    } catch (error: any) {
      message.error(error.message || '加载文档列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // 加载项目列表
    listProject({}).then((res: any) => {
      if (res.code === 0) {
        setProjectList(res.data || []);
      }
    });
  }, []);

  const handleAdd = () => {
    setEditingDocument(null);
    form.resetFields();
    setFileList([]);
    form.setFieldsValue({
      doc_type: 'prd',
    });
    setModalVisible(true);
  };

  const handleEdit = (record: RequirementDocumentData) => {
    setEditingDocument(record);
    form.setFieldsValue({
      name: record.name,
      doc_type: record.doc_type,
      project_id: record.project_id,
      file_path: record.file_path,
      file_name: record.file_name,
      content: record.content,
    });
    setModalVisible(true);
  };

  const handleDelete = async (record: RequirementDocumentData) => {
    try {
      const res = await deleteDocument(record.id);
      if (res.code === 0) {
        message.success('删除成功');
        loadDocuments();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      let res;
      if (editingDocument) {
        res = await updateDocument(editingDocument.id, values);
      } else {
        res = await createDocument(values);
      }

      if (res.code === 0) {
        message.success(editingDocument ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadDocuments();
      } else {
        message.error(res.msg || '操作失败');
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '文档类型',
      dataIndex: 'doc_type',
      key: 'doc_type',
      width: 120,
      render: (doc_type: string) => (
        <Tag color={getDocTypeColor(doc_type)}>{getDocTypeLabel(doc_type)}</Tag>
      ),
    },
    {
      title: '文件名',
      dataIndex: 'file_name',
      key: 'file_name',
      width: 200,
    },
    {
      title: '创建人',
      dataIndex: 'create_user',
      key: 'create_user',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: RequirementDocumentData) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个文档吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="需求文档管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增文档
          </Button>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 文档表单对话框 */}
      <Modal
        title={editingDocument ? '编辑需求文档' : '新增需求文档'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="文档名称"
                rules={[{ required: true, message: '请输入文档名称' }]}
              >
                <Input placeholder="如：用户登录需求文档" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="doc_type"
                label="文档类型"
                rules={[{ required: true, message: '请选择文档类型' }]}
              >
                <Select options={docTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="project_id" label="关联项目">
                <Select
                  placeholder="请选择项目"
                  allowClear
                  options={projectList.map((p: any) => ({ label: p.name, value: p.id }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="file_name" label="文件名">
                <Input placeholder="上传文件后自动填充" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="content" label="文档内容">
                <TextArea rows={6} placeholder="粘贴文档内容或描述" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default RequirementPage;
