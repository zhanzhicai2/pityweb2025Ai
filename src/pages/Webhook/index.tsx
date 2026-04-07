import {
  createConfig,
  deleteConfig,
  listConfigs,
  testWebhook,
  updateConfig,
} from '@/services/webhook';
import { DeleteOutlined, EditOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Button, Form, message, Modal, Popconfirm, Space, Switch, Tag } from 'antd';
import { useEffect, useRef, useState } from 'react';

const eventTypeOptions = [
  { label: '测试计划执行完成', value: 'test_plan_finished' },
  { label: '测试计划执行失败', value: 'test_plan_failed' },
  { label: '任务调度执行完成', value: 'scheduler_finished' },
  { label: '任务调度执行失败', value: 'scheduler_failed' },
  { label: 'AI 生成完成', value: 'ai_generated' },
];

const methodOptions = [
  { label: 'POST', value: 'POST' },
  { label: 'GET', value: 'GET' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
];

const contentTypeOptions = [
  { label: 'JSON', value: 'json' },
  { label: 'Text', value: 'text' },
];

interface WebhookFormProps {
  record: any;
  onCancel: () => void;
  onSuccess: () => void;
}

const WebhookForm: React.FC<WebhookFormProps> = ({ record, onSuccess }) => {
  const [form] = Form.useForm();
  const [, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        headers: record.headers || '{}',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        method: 'POST',
        content_type: 'json',
        enabled: true,
        event_type: 'test_plan_finished',
      });
    }
  }, [record, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      let res;
      if (record?.id) {
        res = await updateConfig(record.id, values);
      } else {
        res = await createConfig(values);
      }
      if (res.code === 0) {
        message.success(record?.id ? '更新成功' : '创建成功');
        onSuccess();
      } else {
        message.error(res.msg || '操作失败');
      }
    } catch (e) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const formColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      formItemProps: {
        rules: [{ required: true, message: '请输入名称' }],
      },
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      formItemProps: {
        rules: [{ required: true, message: '请输入回调地址' }],
      },
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      valueType: 'select',
      fieldProps: { options: methodOptions },
      formItemProps: {
        rules: [{ required: true }],
      },
    },
    {
      title: 'Content-Type',
      dataIndex: 'content_type',
      key: 'content_type',
      valueType: 'select',
      fieldProps: { options: contentTypeOptions },
    },
    {
      title: '事件类型',
      dataIndex: 'event_type',
      key: 'event_type',
      valueType: 'select',
      fieldProps: { options: eventTypeOptions },
      formItemProps: {
        rules: [{ required: true }],
      },
    },
    {
      title: '签名密钥',
      dataIndex: 'secret',
      key: 'secret',
      tooltip: '用于钉钉/企业微信加签',
    },
    {
      title: '自定义请求头',
      dataIndex: 'headers',
      key: 'headers',
      valueType: 'textarea',
      fieldProps: { placeholder: '{"Authorization": "Bearer xxx"}' },
    },
    {
      title: '消息模板',
      dataIndex: 'template',
      key: 'template',
      valueType: 'textarea',
      fieldProps: { rows: 4, placeholder: '{"msg": "测试完成", "status": "{{status}}"}' },
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      valueType: 'switch',
      initialValue: true,
    },
  ];

  return (
    <ProTable
      type="form"
      columns={formColumns}
      onSubmit={handleSubmit}
      rowKey="id"
      pagination={false}
    />
  );
};

const WebhookPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [testBody, setTestBody] = useState('{"msg": "这是一条测试消息"}');

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteConfig(id);
      if (res.code === 0) {
        message.success('删除成功');
        actionRef.current?.reload();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleTest = (record: any) => {
    setTestUrl(record.url);
    setTestBody(record.template || '{"msg": "这是一条测试消息"}');
    setEditingRecord(record);
    setTestModalVisible(true);
  };

  const handleTestSend = async () => {
    try {
      const res = await testWebhook({
        url: testUrl,
        method: 'POST',
        body: testBody,
        headers: '{}',
        secret: editingRecord?.secret || '',
        content_type: 'json',
      });
      if (res.code === 0) {
        message.success('发送成功');
      } else {
        message.error(res.msg || '发送失败');
      }
    } catch (e) {
      message.error('发送失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      width: 250,
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 80,
      render: (_: any, record: any) => (
        <Tag color={record.method === 'GET' ? 'blue' : 'green'}>{record.method}</Tag>
      ),
    },
    {
      title: '事件类型',
      dataIndex: 'event_type',
      key: 'event_type',
      width: 150,
      render: (_: any, record: any) => {
        const event = eventTypeOptions.find((e) => e.value === record.event_type);
        return <Tag>{event?.label || record.event_type}</Tag>;
      },
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (_: any, record: any) => <Switch checked={record.enabled} disabled />,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      valueType: 'option',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<SendOutlined />}
            onClick={() => handleTest(record)}
          >
            测试
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确认删除"
            description="确定要删除这个 Webhook 配置吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle="Webhook 配置"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              setModalVisible(true);
            }}
          >
            新建
          </Button>,
        ]}
        request={async () => {
          const res = await listConfigs({ skip: 0, limit: 100 });
          return {
            data: res.data?.list || [],
            total: res.data?.total || 0,
            success: res.code === 0,
          };
        }}
        columns={columns}
      />

      {/* 新建/编辑 Modal */}
      <Modal
        title={editingRecord ? '编辑 Webhook' : '新建 Webhook'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
        }}
        footer={null}
        width={600}
      >
        <WebhookForm
          record={editingRecord}
          onCancel={() => {
            setModalVisible(false);
            setEditingRecord(null);
          }}
          onSuccess={() => {
            setModalVisible(false);
            setEditingRecord(null);
            actionRef.current?.reload();
          }}
        />
      </Modal>

      {/* 测试 Modal */}
      <Modal
        title="测试 Webhook"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        onOk={handleTestSend}
        okText="发送"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <label>URL:</label>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            style={{ width: '100%', marginTop: 4, padding: '4px 8px' }}
          />
        </div>
        <div>
          <label>Body:</label>
          <textarea
            value={testBody}
            onChange={(e) => setTestBody(e.target.value)}
            style={{ width: '100%', marginTop: 4, padding: '8px', minHeight: 100 }}
          />
        </div>
      </Modal>
    </PageContainer>
  );
};

export default WebhookPage;
