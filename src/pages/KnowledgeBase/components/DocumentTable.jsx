import React from 'react';
import { Badge, Button, Checkbox, Empty, Input, Popconfirm, Space, Table, Tag } from 'antd';
import { UploadOutlined, ReloadOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import moment from 'moment';

const FILE_TYPE_COLORS = {
  pdf: 'blue',
  docx: 'purple',
  md: 'orange',
  txt: 'default',
};

const STATUS_MAP = {
  pending: { text: '待处理', status: 'warning' },
  processing: { text: '处理中', status: 'processing' },
  ready: { text: '就绪', status: 'success' },
  error: { text: '错误', status: 'error' },
};

function formatFileSize(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function DocumentTable({
  currentKB,
  documents,
  loading,
  stats,
  searchKeyword,
  searchAll,
  onSearchKeywordChange,
  onSearchAllChange,
  onSearch,
  onReset,
  onUpload,
  onRefresh,
  onView,
  onDelete,
}) {
  if (!currentKB) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Empty description="请选择左侧知识库查看文档" />
      </div>
    );
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'file_type',
      key: 'file_type',
      width: 80,
      render: (type) => {
        const ext = (type || '').split('/').pop()?.toLowerCase() || type;
        return <Tag color={FILE_TYPE_COLORS[ext] || 'default'}>{ext?.toUpperCase()}</Tag>;
      },
    },
    {
      title: '大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 80,
      render: (size) => formatFileSize(size),
    },
    {
      title: '分块数',
      dataIndex: 'chunk_count',
      key: 'chunk_count',
      width: 70,
      render: (v) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const s = STATUS_MAP[status] || { text: status, status: 'default' };
        return <Badge status={s.status} text={s.text} />;
      },
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (v) => (v ? moment(v).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <a onClick={() => onView(record.id)}>查看</a>
          <Popconfirm title="确定删除该文档？" onConfirm={() => onDelete(record.id)}>
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* 知识库信息栏 */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{currentKB.name}</h3>
        {currentKB.description && (
          <div style={{ color: '#999', fontSize: 13, marginTop: 4 }}>{currentKB.description}</div>
        )}
        <div style={{ marginTop: 8 }}>
          <Space>
            <Tag>文档: {stats.total}</Tag>
            <Tag color="green">已处理: {stats.ready}</Tag>
            {stats.error > 0 && <Tag color="red">失败: {stats.error}</Tag>}
          </Space>
        </div>
      </div>

      {/* 操作栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Space>
          <Input.Search
            placeholder="搜索文档关键词"
            value={searchKeyword}
            onChange={(e) => onSearchKeywordChange(e.target.value)}
            onSearch={() => onSearch(searchKeyword)}
            style={{ width: 220 }}
            allowClear
          />
          <Checkbox checked={searchAll} onChange={(e) => onSearchAllChange(e.target.checked)}>
            搜索全部知识库
          </Checkbox>
        </Space>
        <Space>
          <Button icon={<UploadOutlined />} onClick={onUpload}>
            上传文档
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onRefresh}>
            刷新
          </Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={() => onSearch(searchKeyword)}>
            查询
          </Button>
          <Button icon={<UndoOutlined />} onClick={onReset}>
            重置
          </Button>
        </Space>
      </div>

      {/* 文档表格 */}
      <Table
        columns={columns}
        dataSource={documents}
        loading={loading}
        rowKey="id"
        size="small"
        bordered
        pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
      />
    </div>
  );
}
