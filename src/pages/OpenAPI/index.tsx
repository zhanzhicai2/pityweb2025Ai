import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Input,
  Button,
  Table,
  Tag,
  Space,
  message,
  Spin,
  Modal,
  Select,
  Form,
  Row,
  Col,
  Typography,
  Alert,
} from 'antd';
import { parseOpenAPI, generateTestCases } from '@/services/openapi';
import auth from '@/utils/auth';
import { listProject } from '@/services/project';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

const OpenAPIPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'url' | 'content'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 生成用例 Modal
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [generateForm] = Form.useForm();
  const [projects, setProjects] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  // 加载项目列表
  const loadProjects = async () => {
    try {
      const res = await listProject({ page: 1, size: 10000 });
      if (auth.response(res)) {
        setProjects(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e: any) {
      message.error(`加载项目列表失败: ${e.message}`);
    }
  };

  // 解析 OpenAPI 文档
  const handleParse = async () => {
    if (activeTab === 'url' && !urlInput.trim()) {
      message.warning('请输入 OpenAPI 文档 URL');
      return;
    }
    if (activeTab === 'content' && !contentInput.trim()) {
      message.warning('请输入 OpenAPI 文档内容');
      return;
    }

    setLoading(true);
    try {
      const res = await parseOpenAPI({
        url: activeTab === 'url' ? urlInput.trim() : undefined,
        content: activeTab === 'content' ? contentInput.trim() : undefined,
      });

      if (auth.response(res)) {
        setParsedData(res.data);
        message.success(`解析成功，共 ${res.data.total} 个 API`);
      } else {
        message.error(res.msg || '解析失败');
      }
    } catch (e: any) {
      message.error(e.message || '解析失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置
  const handleReset = () => {
    setParsedData(null);
    setSelectedRowKeys([]);
    setUrlInput('');
    setContentInput('');
  };

  // 打开生成 Modal
  const handleOpenGenerate = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要生成的 API');
      return;
    }
    loadProjects();
    setGenerateModalVisible(true);
  };

  // 生成测试用例
  const handleGenerate = async () => {
    try {
      const values = await generateForm.validateFields();
      const selectedAPIs = parsedData.apis.filter((api: any) =>
        selectedRowKeys.includes(api.path + api.method),
      );

      setGenerating(true);
      const res = await generateTestCases({
        project_id: values.project_id,
        apis: selectedAPIs,
        base_url: parsedData.base_url,
      });

      if (auth.response(res)) {
        message.success(`成功生成 ${res.data.generated} 个测试用例`);
        setGenerateModalVisible(false);
        generateForm.resetFields();
      } else {
        message.error(res.msg || '生成失败');
      }
    } catch (e: any) {
      message.error(e.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  // 方法颜色
  const methodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'green',
      POST: 'blue',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple',
    };
    return colors[method.toUpperCase()] || 'default';
  };

  // 表格列定义
  const columns = [
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
      render: (path: string, record: any) => (
        <Space>
          <Tag color={methodColor(record.method)}>{record.method}</Tag>
          <Text code>{path}</Text>
        </Space>
      ),
    },
    {
      title: '名称',
      dataIndex: 'summary',
      key: 'summary',
      width: 200,
      ellipsis: true,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 120,
      render: (tags: string[]) => (
        <>
          {tags?.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '参数',
      key: 'params',
      width: 150,
      render: (_: any, record: any) => {
        const { parameters } = record;
        const paramCount =
          (parameters?.path?.length || 0) +
          (parameters?.query?.length || 0) +
          (parameters?.header?.length || 0);
        const hasBody = !!record.request_body;
        return (
          <Space>
            {paramCount > 0 && <Tag>参数 {paramCount}</Tag>}
            {hasBody && <Tag color="green">Body</Tag>}
          </Space>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  // 行选择
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="OpenAPI 导入" style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'url' | 'content')}
          items={[
            {
              key: 'url',
              label: 'URL 解析',
              children: (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="输入 OpenAPI JSON URL，如 https://petstore.swagger.io/v2/swagger.json"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={!!parsedData}
                  />
                  <Button type="primary" onClick={handleParse} loading={loading}>
                    解析
                  </Button>
                </Space>
              ),
            },
            {
              key: 'content',
              label: '内容解析',
              children: (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <TextArea
                    placeholder="粘贴 OpenAPI JSON 内容"
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    rows={8}
                    disabled={!!parsedData}
                  />
                  <Button type="primary" onClick={handleParse} loading={loading}>
                    解析
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {loading && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" tip="正在解析 OpenAPI 文档..." />
        </div>
      )}

      {parsedData && !loading && (
        <>
          <Card
            title={
              <Space>
                <Text strong>{parsedData.title}</Text>
                <Tag color="blue">Swagger {parsedData.version}</Tag>
                <Text type="secondary">{parsedData.base_url}</Text>
              </Space>
            }
            extra={
              <Space>
                <Text type="secondary">
                  已选择 {selectedRowKeys.length} / {parsedData.total} 个 API
                </Text>
                <Button onClick={handleReset}>重新导入</Button>
                <Button
                  type="primary"
                  onClick={handleOpenGenerate}
                  disabled={selectedRowKeys.length === 0}
                >
                  生成用例
                </Button>
              </Space>
            }
          >
            <Alert
              type="info"
              message="勾选要生成的 API，支持批量选择"
              style={{ marginBottom: 16 }}
            />
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={parsedData.apis}
              rowKey={(record) => record.path + record.method}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>

          {/* 生成用例 Modal */}
          <Modal
            title="生成测试用例"
            open={generateModalVisible}
            onOk={handleGenerate}
            onCancel={() => setGenerateModalVisible(false)}
            confirmLoading={generating}
            width={500}
          >
            <Form form={generateForm} layout="vertical">
              <Form.Item
                name="project_id"
                label="目标项目"
                rules={[{ required: true, message: '请选择目标项目' }]}
              >
                <Select placeholder="选择项目" showSearch>
                  {projects.map((p) => (
                    <Option key={p.id} value={p.id}>
                      {p.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Base URL">
                    <Input value={parsedData.base_url} disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="选中 API 数量">
                    <Input value={selectedRowKeys.length} disabled />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default OpenAPIPage;
