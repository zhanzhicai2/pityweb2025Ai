import { deleteDocument, listDocuments, searchKnowledge, searchKnowledgeV2 } from '@/services/rag';
import { DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, Input, message, Modal, Space, Tag, Upload } from 'antd';
import { useCallback, useState } from 'react';

const { Search } = Input;

export default () => {
  const [searchType, setSearchType] = useState<'normal' | 'rerank'>('rerank');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpload = async (file: File) => {
    try {
      message.success(`文档 ${file.name} 上传成功`);
      return false; // 阻止默认上传
    } catch (e: any) {
      message.error(`上传失败: ${e?.message || '未知错误'}`);
      return false;
    }
  };

  const handleDelete = async (docId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确认删除该文档？',
      onOk: async () => {
        try {
          await deleteDocument(docId);
          message.success('删除成功');
          return true;
        } catch (e: any) {
          message.error(`删除失败: ${e?.message || '未知错误'}`);
          return false;
        }
      },
    });
  };

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        message.warning('请输入搜索关键词');
        return;
      }
      setSearchLoading(true);
      setSearchQuery(query);
      try {
        const res =
          searchType === 'rerank'
            ? await searchKnowledgeV2(query, 10, 50)
            : await searchKnowledge(query, 10, true);
        if (res?.code === 0) {
          setSearchResults(res?.data?.results || []);
        } else {
          message.error(res?.msg || '搜索失败');
        }
      } catch (e: any) {
        message.error(`搜索失败: ${e?.message || '未知错误'}`);
      } finally {
        setSearchLoading(false);
      }
    },
    [searchType],
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '文件类型',
      dataIndex: 'file_type',
      key: 'file_type',
      width: 100,
      render: (text: string) => <Tag color="blue">{(text as string) || 'unknown'}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text: string) => {
        const color =
          (text as string) === 'ready' ? 'green' : (text as string) === 'error' ? 'red' : 'orange';
        return <Tag color={color}>{(text as string) || 'pending'}</Tag>;
      },
    },
    {
      title: '块数',
      dataIndex: 'chunk_count',
      key: 'chunk_count',
      width: 80,
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 100,
      render: (size: number) => (size ? `${((size as number) / 1024).toFixed(1)} KB` : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const searchColumns = [
    {
      title: '相关度',
      dataIndex: 'relevance_score',
      key: 'relevance_score',
      width: 80,
      render: (score: number) => (score ? `${((score as number) * 100).toFixed(1)}%` : '-'),
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 上传区域 */}
        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <Upload accept=".pdf,.docx,.md,.txt" showUploadList={false} beforeUpload={handleUpload}>
            <Button type="primary" icon={<UploadOutlined />}>
              上传文档到知识库
            </Button>
          </Upload>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            支持格式: PDF, DOCX, Markdown, TXT
          </div>
        </div>

        {/* 搜索区域 */}
        <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
          <Space style={{ marginBottom: 16 }}>
            <Search
              placeholder="输入关键词搜索知识库..."
              enterButton={
                <>
                  <SearchOutlined /> 搜索
                </>
              }
              size="large"
              loading={searchLoading}
              onSearch={handleSearch}
              style={{ width: 400 }}
            />
            <Button.Group>
              <Button
                onClick={() => setSearchType('normal')}
                type={searchType === 'normal' ? 'primary' : 'default'}
              >
                普通检索
              </Button>
              <Button
                onClick={() => setSearchType('rerank')}
                type={searchType === 'rerank' ? 'primary' : 'default'}
              >
                Rerank精排
              </Button>
            </Button.Group>
          </Space>

          {/* 搜索结果 */}
          {searchQuery && (
            <div>
              <div style={{ marginBottom: 8, color: '#666' }}>
                搜索「{searchQuery}」的结果 ({searchResults.length} 条)
              </div>
              <ProTable
                columns={searchColumns as any}
                dataSource={searchResults}
                rowKey={(record, index) => record.content?.substring(0, 50) || index}
                pagination={{ pageSize: 10 }}
                options={false}
                search={false}
                toolBarRender={false}
              />
            </div>
          )}
        </div>

        {/* 文档列表 */}
        <ProTable
          columns={columns as any}
          request={async (params) => {
            const res = await listDocuments(
              params.current || 1,
              params.pageSize || 20,
              params.name || '',
            );
            return {
              data: res?.data?.list || [],
              success: res?.code === 0,
              total: res?.data?.total || 0,
            };
          }}
          rowKey="id"
          pagination={{ defaultPageSize: 20 }}
          search={{
            labelWidth: 'auto',
          }}
          options={false}
          toolBarRender={() => [
            <Upload
              key="upload"
              accept=".pdf,.docx,.md,.txt"
              showUploadList={false}
              beforeUpload={handleUpload}
            >
              <Button icon={<UploadOutlined />}>上传</Button>
            </Upload>,
          ]}
        />
      </Space>
    </div>
  );
};
