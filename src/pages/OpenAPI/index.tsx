import { generateTestcases, parseOpenApiByContent, parseOpenApiByUrl } from '@/services/openapi';
import { PageContainer } from '@ant-design/pro-components';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Button, message, Modal, Space, Tabs, Tag } from 'antd';
import { useRef, useState } from 'react';

const OpenAPIPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState('url');
  const [parsedApis, setParsedApis] = useState<any[]>([]);
  const [selectedApis, setSelectedApis] = useState<any[]>([]);
  const [parseResult, setParseResult] = useState<any>(null);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [projectId, setProjectId] = useState<number>(0);

  const handleParseByUrl = async (url: string) => {
    try {
      const res = await parseOpenApiByUrl({ url });
      if (res.code === 0) {
        setParseResult(res.data);
        setParsedApis(res.data.apis || []);
        message.success(`解析成功，共 ${res.data.total} 个 API`);
      } else {
        message.error(res.msg || '解析失败');
      }
    } catch (e) {
      message.error('解析失败');
    }
  };

  const handleParseByContent = async (content: string) => {
    try {
      const res = await parseOpenApiByContent({ content });
      if (res.code === 0) {
        setParseResult(res.data);
        setParsedApis(res.data.apis || []);
        message.success(`解析成功，共 ${res.data.total} 个 API`);
      } else {
        message.error(res.msg || '解析失败');
      }
    } catch (e) {
      message.error('解析失败');
    }
  };

  const handleGenerate = async () => {
    if (!projectId) {
      message.error('请输入项目ID');
      return;
    }
    if (selectedApis.length === 0) {
      message.error('请选择要生成的 API');
      return;
    }
    try {
      const res = await generateTestcases({
        project_id: projectId,
        apis: selectedApis,
        base_url: parseResult?.base_url,
      });
      if (res.code === 0) {
        message.success(`成功生成 ${res.data.generated} 个测试用例`);
        setGenerateModalVisible(false);
      } else {
        message.error(res.msg || '生成失败');
      }
    } catch (e) {
      message.error('生成失败');
    }
  };

  const columns = [
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
      render: (_: any, record: any) => <Tag color="blue">{record.method}</Tag>,
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 80,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 120,
      render: (_: any, record: any) => (
        <>
          {record.tags?.map((tag: string) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedApis([record]);
              setGenerateModalVisible(true);
            }}
          >
            生成用例
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'url',
      label: 'URL 解析',
      children: (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            id="openapi-url"
            placeholder="输入 OpenAPI 文档 URL"
            style={{ width: 400, marginRight: 8, padding: '4px 8px' }}
          />
          <Button
            type="primary"
            onClick={() => {
              const url = (document.getElementById('openapi-url') as HTMLInputElement).value;
              if (url) handleParseByUrl(url);
            }}
          >
            解析
          </Button>
        </div>
      ),
    },
    {
      key: 'content',
      label: '内容解析',
      children: (
        <div style={{ marginBottom: 16 }}>
          <textarea
            id="openapi-content"
            placeholder="粘贴 OpenAPI JSON 内容"
            style={{ width: 600, height: 200, marginRight: 8, padding: '8px' }}
          />
          <br />
          <Button
            type="primary"
            onClick={() => {
              const content = (document.getElementById('openapi-content') as HTMLTextAreaElement)
                .value;
              if (content) handleParseByContent(content);
            }}
          >
            解析
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {parseResult && (
        <div style={{ marginBottom: 16 }}>
          <Tag color="green">{parseResult.title}</Tag>
          <Tag color="blue">版本: {parseResult.version}</Tag>
          <Tag>基础URL: {parseResult.base_url}</Tag>
          <Tag>共 {parseResult.total} 个 API</Tag>
        </div>
      )}

      <ProTable
        headerTitle="API 列表"
        actionRef={actionRef}
        rowKey="path"
        dataSource={parsedApis}
        columns={columns}
        search={false}
        pagination={{ pageSize: 20 }}
        toolBarRender={() => [
          <Button
            key="batch"
            type="primary"
            onClick={() => {
              if (parsedApis.length > 0) {
                setSelectedApis(parsedApis);
                setGenerateModalVisible(true);
              }
            }}
            disabled={parsedApis.length === 0}
          >
            批量生成 ({parsedApis.length})
          </Button>,
        ]}
      />

      <Modal
        title="生成测试用例"
        open={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        onOk={handleGenerate}
        okText="生成"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <label>项目ID:</label>
          <input
            type="number"
            value={projectId || ''}
            onChange={(e) => setProjectId(parseInt(e.target.value) || 0)}
            style={{ width: '100%', marginTop: 4, padding: '4px 8px' }}
            placeholder="输入项目ID"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>已选择 {selectedApis.length} 个 API</label>
        </div>
        <div>
          <label>基础URL:</label>
          <input
            type="text"
            value={parseResult?.base_url || ''}
            style={{ width: '100%', marginTop: 4, padding: '4px 8px' }}
            placeholder="基础 URL"
          />
        </div>
      </Modal>
    </PageContainer>
  );
};

export default OpenAPIPage;
