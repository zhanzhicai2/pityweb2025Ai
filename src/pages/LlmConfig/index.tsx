import {
  createConfig,
  deleteConfig,
  listConfigs,
  LLMConfigCreateData,
  LLMConfigData,
  LLMProvider,
  setDefaultConfig,
  testConfig,
  updateConfig,
} from '@/services/llmConfig';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StarOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;

const LlmConfigPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<LLMConfigData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LLMConfigData | null>(null);
  const [testingConfig, setTestingConfig] = useState<LLMConfigData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('Hello, this is a test message.');
  const [testResult, setTestResult] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchProvider, setSearchProvider] = useState<string | undefined>(undefined);
  const [searchActive, setSearchActive] = useState<boolean | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const providerOptions = [
    { label: 'OpenAI', value: 'openai' },
    { label: 'Azure OpenAI', value: 'azure_openai' },
    { label: 'Anthropic (Claude)', value: 'anthropic' },
    { label: 'Ollama (本地)', value: 'ollama' },
    { label: '自定义 API', value: 'custom' },
  ];

  const getProviderTagType = (provider: string) => {
    const types: Record<string, string> = {
      openai: 'success',
      azure_openai: 'processing',
      anthropic: 'warning',
      ollama: 'default',
      custom: 'default',
    };
    return types[provider] || 'default';
  };

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      openai: 'OpenAI',
      azure_openai: 'Azure',
      anthropic: 'Anthropic',
      ollama: 'Ollama',
      custom: '自定义',
    };
    return labels[provider] || provider;
  };

  const maskApiKey = (apiKey: string) => {
    if (!apiKey) return '';
    if (apiKey.length <= 8) return '***';
    return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
  };

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await listConfigs({
        provider: searchProvider,
        is_active: searchActive,
      });
      if (res.code === 0) {
        let data = res.data || [];
        // 前端关键词搜索
        if (searchKeyword) {
          const kw = searchKeyword.toLowerCase();
          data = data.filter(
            (item: LLMConfigData) =>
              item.config_name?.toLowerCase().includes(kw) ||
              item.name?.toLowerCase().includes(kw) ||
              item.model_name?.toLowerCase().includes(kw),
          );
        }
        setDataSource(data);
      } else {
        message.error(res.msg || '加载配置列表失败');
      }
    } catch (error: any) {
      message.error(error.message || '加载配置列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadConfigs();
  };

  const handleReset = () => {
    setSearchProvider(undefined);
    setSearchActive(undefined);
    setSearchKeyword('');
    loadConfigs();
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleAdd = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({
      provider: 'openai',
      temperature: 0.7,
      max_tokens: 2000,
      supports_vision: false,
      context_limit: 128000,
      is_default: false,
      is_active: true,
      base_url: 'https://api.openai.com/v1',
    });
    setModalVisible(true);
  };

  const handleEdit = (record: LLMConfigData) => {
    setEditingConfig(record);
    form.setFieldsValue({
      config_name: record.config_name,
      name: record.name,
      provider: record.provider,
      model_name: record.model_name,
      api_key: record.api_key,
      base_url: record.base_url,
      system_prompt: record.system_prompt,
      temperature: record.temperature,
      max_tokens: record.max_tokens,
      supports_vision: record.supports_vision,
      context_limit: record.context_limit,
      is_default: record.is_default,
      is_active: record.is_active,
    });
    setModalVisible(true);
  };

  const handleDelete = async (record: LLMConfigData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除配置"${record.config_name}"吗？`,
      onOk: async () => {
        try {
          const res = await deleteConfig(record.id);
          if (res.code === 0) {
            message.success('删除成功');
            loadConfigs();
          } else {
            message.error(res.msg || '删除失败');
          }
        } catch (error: any) {
          message.error(error.message || '删除失败');
        }
      },
    });
  };

  const handleSetDefault = async (record: LLMConfigData) => {
    try {
      const res = await setDefaultConfig(record.id);
      if (res.code === 0) {
        message.success('设置成功');
        loadConfigs();
      } else {
        message.error(res.msg || '设置失败');
      }
    } catch (error: any) {
      message.error(error.message || '设置失败');
    }
  };

  const handleTest = (record: LLMConfigData) => {
    setTestingConfig(record);
    setTestMessage('Hello, this is a test message.');
    setTestResult(null);
    setTestModalVisible(true);
  };

  const handleRunTest = async () => {
    if (!testingConfig) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testConfig({
        config_id: testingConfig.id,
        test_message: testMessage,
      });
      setTestResult(res.data || res);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: '测试失败',
        error: error.message || '未知错误',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleProviderChange = (provider: LLMProvider) => {
    const defaults: Record<string, Partial<LLMConfigCreateData>> = {
      openai: { base_url: 'https://api.openai.com/v1', context_limit: 128000 },
      azure_openai: { base_url: '', context_limit: 128000 },
      anthropic: { base_url: 'https://api.anthropic.com/v1', context_limit: 200000 },
      ollama: { base_url: 'http://localhost:11434', context_limit: 8000 },
      custom: { base_url: '', context_limit: 128000 },
    };
    const d = defaults[provider] || {};
    if (d.base_url !== undefined) form.setFieldValue('base_url', d.base_url);
    if (d.context_limit !== undefined) form.setFieldValue('context_limit', d.context_limit);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      // 设置 model_name 与 name 相同
      values.model_name = values.name;

      let res;
      if (editingConfig) {
        res = await updateConfig(editingConfig.id, values);
      } else {
        res = await createConfig(values);
      }

      if (res.code === 0) {
        message.success(editingConfig ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadConfigs();
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
      title: '配置名称',
      dataIndex: 'config_name',
      key: 'config_name',
      width: 150,
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      key: 'provider',
      width: 120,
      render: (provider: string) => (
        <Tag color={getProviderTagType(provider)}>{getProviderLabel(provider)}</Tag>
      ),
    },
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'API Key',
      dataIndex: 'api_key',
      key: 'api_key',
      width: 200,
      render: (api_key: string) => (
        <span style={{ fontFamily: 'monospace' }}>{maskApiKey(api_key)}</span>
      ),
    },
    {
      title: '参数',
      key: 'params',
      width: 180,
      render: (_: any, record: LLMConfigData) => (
        <div style={{ fontSize: 13, color: '#666' }}>
          <div>温度: {record.temperature}</div>
          <div>最大令牌: {record.max_tokens}</div>
        </div>
      ),
    },
    {
      title: '默认',
      dataIndex: 'is_default',
      key: 'is_default',
      width: 80,
      align: 'center' as const,
      render: (is_default: boolean) =>
        is_default ? <Tag color="success">是</Tag> : <Tag color="default">否</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      align: 'center' as const,
      render: (is_active: boolean, record: LLMConfigData) => (
        <Switch
          checked={is_active}
          onChange={async (checked) => {
            try {
              const res = await updateConfig(record.id, { is_active: checked });
              if (res.code === 0) {
                message.success('状态更新成功');
                loadConfigs();
              } else {
                message.error(res.msg || '状态更新失败');
              }
            } catch (error: any) {
              message.error(error.message || '状态更新失败');
            }
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      align: 'center' as const,
      render: (_: any, record: LLMConfigData) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => handleTest(record)}
          >
            测试
          </Button>
          {!record.is_default && (
            <Button
              type="primary"
              size="small"
              icon={<StarOutlined />}
              onClick={() => handleSetDefault(record)}
            >
              设为默认
            </Button>
          )}
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="LLM 配置管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增配置
          </Button>
        }
      >
        {/* 搜索表单 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              placeholder="提供商"
              allowClear
              style={{ width: 150 }}
              value={searchProvider}
              onChange={(value) => setSearchProvider(value)}
              options={[{ label: '全部', value: undefined }, ...providerOptions]}
            />
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 120 }}
              value={searchActive}
              onChange={(value) => setSearchActive(value)}
              options={[
                { label: '全部', value: undefined },
                { label: '启用', value: true },
                { label: '禁用', value: false },
              ]}
            />
            <Input
              placeholder="配置名称/模型名称"
              allowClear
              style={{ width: 200 }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </Card>

      {/* 配置表单对话框 */}
      <Modal
        title={editingConfig ? '编辑 LLM 配置' : '新增 LLM 配置'}
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
                name="config_name"
                label="配置名称"
                rules={[{ required: true, message: '请输入配置名称' }]}
              >
                <Input placeholder="如：生产环境OpenAI" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="provider"
                label="提供商"
                rules={[{ required: true, message: '请选择提供商' }]}
              >
                <Select options={providerOptions} onChange={handleProviderChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="模型名称"
                rules={[{ required: true, message: '请输入模型名称' }]}
              >
                <Input placeholder="如：gpt-4, claude-3-sonnet" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="api_key" label="API Key">
                <Input.Password placeholder="请输入 API Key（本地模型如 Ollama 可留空）" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="base_url" label="API 基础URL">
                <Input placeholder="如：https://api.openai.com/v1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="system_prompt" label="系统提示词">
                <TextArea rows={3} placeholder="可选：指导 LLM 行为的系统级提示词" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="temperature" label="温度参数">
                <Slider min={0} max={2} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_tokens" label="最大令牌数">
                <InputNumber min={100} max={100000} step={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="context_limit" label="上下文限制">
                <InputNumber min={1000} max={2000000} step={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="supports_vision" label="多模态支持" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_default" label="设为默认" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" label="启用状态" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 测试对话框 */}
      <Modal
        title="测试 LLM 配置"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTestModalVisible(false)}>
            关闭
          </Button>,
          <Button key="test" type="primary" loading={testing} onClick={handleRunTest}>
            开始测试
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="测试消息">
            <TextArea
              rows={3}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="输入测试消息"
            />
          </Form.Item>

          {testResult && (
            <Alert
              message={testResult.message}
              type={testResult.success ? 'success' : 'error'}
              showIcon
              description={
                testResult.success ? (
                  <div>
                    <p style={{ marginBottom: 8 }}>
                      <strong>响应内容：</strong>
                    </p>
                    <pre
                      style={{
                        background: '#f5f5f5',
                        padding: 12,
                        borderRadius: 4,
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      {testResult.response}
                    </pre>
                    <p style={{ marginTop: 8 }}>
                      <strong>响应时间：</strong>
                      {testResult.latency}秒
                    </p>
                  </div>
                ) : (
                  <div>
                    <strong>错误信息：</strong>
                    {testResult.error}
                  </div>
                )
              }
            />
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default LlmConfigPage;
