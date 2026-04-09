import React, { Component } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Switch,
  Table,
  InputNumber,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';
import {
  deleteLlmConfig,
  insertLlmConfig,
  listLlmConfig,
  setDefaultLlmConfig,
  testLlmConfig,
  updateLlmConfig,
} from '@/services/llmConfig';
import auth from '@/utils/auth';
import FormForModal from '@/components/PityForm/FormForModal';

const { Option } = Select;
const { TextArea } = Input;

const PROVIDERS = [
  'OpenAI',
  'DeepSeek',
  'Qwen',
  'Ollama',
  'Claude',
  'GLM',
  'MiniMax',
  'Azure',
  'Gemini',
  'Custom',
];

const LLM_FIELDS = (record = {}) => [
  {
    name: 'config_name',
    label: '配置名称',
    required: true,
    message: '请输入配置名称',
    type: 'input',
    placeholder: '请输入配置名称',
    initialValue: record.config_name,
    span: 24,
  },
  {
    name: 'name',
    label: '模型名称',
    required: true,
    message: '请输入模型名称',
    type: 'input',
    placeholder: '请输入模型名称，如 gpt-4、deepseek-chat',
    initialValue: record.name,
    span: 24,
  },
  {
    name: 'provider',
    label: '提供商',
    required: true,
    message: '请选择提供商',
    type: 'select',
    initialValue: record.provider || 'OpenAI',
    component: (
      <Select placeholder="请选择提供商">
        {PROVIDERS.map((p) => (
          <Option key={p} value={p}>
            {p}
          </Option>
        ))}
      </Select>
    ),
    span: 24,
  },
  {
    name: 'model_name',
    label: '模型标识',
    required: true,
    message: '请输入模型标识',
    type: 'input',
    placeholder: '模型标识，如 gpt-4、deepseek-chat',
    initialValue: record.model_name,
    span: 24,
  },
  {
    name: 'api_key',
    label: 'API Key',
    required: false,
    message: '请输入API Key',
    type: 'input',
    placeholder: '本地模型（如 Ollama）可留空',
    initialValue: record.api_key,
    span: 24,
  },
  {
    name: 'base_url',
    label: 'API 基础URL',
    required: false,
    message: '请输入API基础URL',
    type: 'input',
    placeholder: '如 https://api.openai.com/v1',
    initialValue: record.base_url || 'https://api.openai.com/v1',
    span: 24,
  },
  {
    name: 'system_prompt',
    label: '系统提示词',
    required: false,
    message: '请输入系统提示词',
    type: 'input',
    placeholder: '可选，设置默认系统提示词',
    initialValue: record.system_prompt,
    span: 24,
  },
  {
    name: 'temperature',
    label: '温度参数',
    required: false,
    type: 'input',
    initialValue: record.temperature ?? 0.7,
    component: <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />,
    span: 12,
  },
  {
    name: 'max_tokens',
    label: '最大令牌数',
    required: false,
    type: 'input',
    initialValue: record.max_tokens ?? 2000,
    component: <InputNumber min={100} max={100000} step={100} style={{ width: '100%' }} />,
    span: 12,
  },
  {
    name: 'context_limit',
    label: '上下文限制',
    required: false,
    type: 'input',
    initialValue: record.context_limit ?? 128000,
    component: <InputNumber min={1000} max={2000000} step={1000} style={{ width: '100%' }} />,
    span: 12,
  },
  {
    name: 'supports_vision',
    label: '多模态支持',
    required: false,
    type: 'switch',
    valuePropName: 'checked',
    initialValue: record.supports_vision ?? false,
    component: <Switch />,
    span: 12,
  },
  {
    name: 'is_default',
    label: '设为默认',
    required: false,
    type: 'switch',
    valuePropName: 'checked',
    initialValue: record.is_default ?? false,
    component: <Switch />,
    span: 12,
  },
  {
    name: 'is_active',
    label: '启用状态',
    required: false,
    type: 'switch',
    valuePropName: 'checked',
    initialValue: record.is_active ?? true,
    component: <Switch />,
    span: 12,
  },
];

class LlmConfig extends Component {
  state = {
    data: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    provider: undefined,
    is_active: undefined,
    name: '',
    loading: false,
    visible: false,
    record: { id: 0 },
    testVisible: false,
    testLoading: false,
    testRecord: {},
    testMessage: 'Hello, this is a test message.',
    testResult: '',
  };

  async componentDidMount() {
    await this.fetchList();
  }

  fetchList = async (page = 1, size = 10) => {
    this.setState({ loading: true });
    const { provider, is_active, name } = this.state;
    const res = await listLlmConfig({ page, size, provider, is_active, name });
    if (auth.response(res)) {
      const data = res.data || [];
      this.setState({
        data,
        pagination: { total: res.total || data.length || 0, current: page, pageSize: size },
      });
    }
    this.setState({ loading: false });
  };

  onSearch = async () => {
    await this.fetchList(1);
  };

  onReset = async () => {
    this.setState({ provider: undefined, is_active: undefined, name: '' });
    await this.fetchList(1);
  };

  onFinish = async (values) => {
    const { record } = this.state;
    const params = {
      ...values,
      supports_vision: !!values.supports_vision,
      is_default: !!values.is_default,
      is_active: values.is_active !== undefined ? values.is_active : true,
    };
    let res;
    if (record.id === 0) {
      res = await insertLlmConfig(params);
    } else {
      res = await updateLlmConfig(record.id, params);
    }
    if (auth.response(res, true)) {
      this.setState({ visible: false });
      await this.fetchList();
    }
  };

  onDelete = async (id) => {
    const res = await deleteLlmConfig(id);
    auth.response(res, true);
    await this.fetchList();
  };

  onSetDefault = async (id) => {
    const res = await setDefaultLlmConfig(id);
    if (auth.response(res, true)) {
      message.success('设置默认成功');
      await this.fetchList();
    }
  };

  onTest = (record) => {
    this.setState({
      testVisible: true,
      testRecord: record,
      testResult: '',
      testMessage: 'Hello, this is a test message.',
    });
  };

  onTestConfirm = async () => {
    const { testRecord, testMessage } = this.state;
    this.setState({ testLoading: true, testResult: '' });
    const res = await testLlmConfig({ config_id: testRecord.id, test_message: testMessage });
    this.setState({ testLoading: false });
    // 测试接口返回 {success, message, response, error, latency}，不走 auth.response 的 code 判断
    if (!res || res.success === undefined) {
      this.setState({ testResult: '❌ 网络异常，请稍后重试' });
    } else if (res.success) {
      this.setState({
        testResult: `✅ ${res.message}\n响应: ${res.response}\n延迟: ${res.latency}ms`,
      });
    } else {
      this.setState({
        testResult: `❌ ${res.message}\n错误: ${res.error}\n延迟: ${res.latency}ms`,
      });
    }
  };

  render() {
    const columns = [
      { title: '配置名称', dataIndex: 'config_name', key: 'config_name' },
      { title: '提供商', dataIndex: 'provider', key: 'provider' },
      { title: '模型名称', dataIndex: 'name', key: 'name' },
      {
        title: 'API Key',
        dataIndex: 'api_key',
        key: 'api_key',
        render: (val) => {
          if (!val) return '-';
          if (val.length > 10) return `${val.slice(0, 6)}...${val.slice(-4)}`;
          return val;
        },
      },
      {
        title: '参数',
        key: 'params',
        render: (_, record) => (
          <span>
            温度: {record.temperature} / 最大令牌: {record.max_tokens}
          </span>
        ),
      },
      {
        title: '默认',
        dataIndex: 'is_default',
        key: 'is_default',
        render: (val) => (val ? '是' : '否'),
      },
      {
        title: '状态',
        dataIndex: 'is_active',
        key: 'is_active',
        render: (val, record) => (
          <Switch
            checked={val}
            onChange={async (checked) => {
              const res = await updateLlmConfig(record.id, { is_active: checked });
              auth.response(res, true);
              await this.fetchList();
            }}
          />
        ),
      },
      {
        title: '操作',
        key: 'operation',
        render: (_, record) => (
          <>
            <a onClick={() => this.onTest(record)}>测试</a>
            <Divider type="vertical" />
            {!record.is_default && (
              <>
                <a onClick={() => this.onSetDefault(record.id)}>设为默认</a>
                <Divider type="vertical" />
              </>
            )}
            <a onClick={() => this.setState({ visible: true, record })}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => this.onDelete(record.id)}>删除</a>
          </>
        ),
      },
    ];

    return (
      <PageContainer title={false} breadcrumb={null}>
        <Spin spinning={this.state.loading}>
          <Card>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={4}>
                <Select
                  allowClear
                  placeholder="提供商"
                  style={{ width: '100%' }}
                  value={this.state.provider}
                  onChange={(val) => this.setState({ provider: val })}
                >
                  {PROVIDERS.map((p) => (
                    <Option key={p} value={p}>
                      {p}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  allowClear
                  placeholder="状态"
                  style={{ width: '100%' }}
                  value={this.state.is_active}
                  onChange={(val) => this.setState({ is_active: val })}
                >
                  <Option value={true}>启用</Option>
                  <Option value={false}>禁用</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Input.Search
                  placeholder="搜索配置名称"
                  value={this.state.name}
                  onSearch={(val) => this.setState({ name: val }, () => this.fetchList(1))}
                  onChange={(e) => this.setState({ name: e.target.value })}
                />
              </Col>
              <Col span={4}>
                <Button type="primary" onClick={this.onSearch}>
                  搜索
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.onReset}>
                  重置
                </Button>
              </Col>
              <Col span={4} style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  onClick={() => this.setState({ visible: true, record: { id: 0 } })}
                >
                  <PlusOutlined />
                  新增配置
                </Button>
              </Col>
            </Row>

            <Table
              dataSource={this.state.data}
              columns={columns}
              onChange={(pagination) => this.fetchList(pagination.current, pagination.pageSize)}
              pagination={this.state.pagination}
              rowKey={(record) => record.id}
            />

            <FormForModal
              open={this.state.visible}
              onCancel={() => this.setState({ visible: false })}
              title={this.state.record.id === 0 ? '新增 LLM 配置' : '编辑 LLM 配置'}
              left={6}
              right={18}
              width={600}
              record={this.state.record}
              onFinish={this.onFinish}
              fields={LLM_FIELDS(this.state.record)}
            />

            <Modal
              title="测试 LLM 配置"
              open={this.state.testVisible}
              onCancel={() => this.setState({ testVisible: false })}
              footer={
                <div>
                  <Button onClick={() => this.setState({ testVisible: false })}>关闭</Button>
                  <Button
                    type="primary"
                    loading={this.state.testLoading}
                    onClick={this.onTestConfirm}
                  >
                    开始测试
                  </Button>
                </div>
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>测试消息</div>
                  <TextArea
                    rows={3}
                    value={this.state.testMessage}
                    onChange={(e) => this.setState({ testMessage: e.target.value })}
                    placeholder="输入测试消息"
                  />
                </Col>
                <Col span={24}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>测试结果</div>
                  <pre
                    style={{
                      background: '#f5f5f5',
                      padding: 12,
                      borderRadius: 4,
                      minHeight: 60,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {this.state.testResult || '点击"开始测试"查看结果'}
                  </pre>
                </Col>
              </Row>
            </Modal>
          </Card>
        </Spin>
      </PageContainer>
    );
  }
}

export default LlmConfig;
