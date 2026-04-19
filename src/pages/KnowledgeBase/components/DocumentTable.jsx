import React from 'react';
import { Badge, Button, Empty, Input, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import {
  UploadOutlined,
  ReloadOutlined,
  SearchOutlined,
  UndoOutlined,
  SettingOutlined,
} from '@ant-design/icons';
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
  ready: { text: '已完成', status: 'success' },
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
  onSearchKeywordChange,
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
    <div>
      {/* 操作栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          flexWrap: 'wrap',
          // gap: 12,
        }}
      >
        <Space size="middle">
          <Input.Search
            placeholder="搜索文档关键词"
            value={searchKeyword}
            onChange={(e) => onSearchKeywordChange(e.target.value)}
            onSearch={() => onSearch(searchKeyword)}
            style={{ width: 260 }}
            allowClear
          />
          <Button icon={<SearchOutlined />} onClick={() => onSearch(searchKeyword)}>
            查询
          </Button>
          <Button icon={<UndoOutlined />} onClick={onReset}>
            重置
          </Button>
        </Space>
        <Space size="middle">
          <Button icon={<SettingOutlined />} onClick={onRefresh}>
            刷新
          </Button>
          <Button type="primary" icon={<UploadOutlined />} onClick={onUpload}>
            上传文档
          </Button>
        </Space>
      </div>

      {/* 描述和状态统计 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 12,
          padding: '8px 12px',
          background: '#fafafa',
          borderRadius: 4,
          flexWrap: 'wrap',
        }}
      >
        {currentKB?.description ? (
          <Tooltip title={currentKB.description}>
            <span
              style={{
                flex: 1,
                minWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              描述：{currentKB.description}
            </span>
          </Tooltip>
        ) : (
          <span style={{ color: '#999' }}>暂无描述</span>
        )}
        <span style={{ color: '#d9d9d9' }}>|</span>
        <span>📄 {stats?.total || 0}</span>
        <Badge status="success" />
        <span>已完成 {stats?.ready || 0}</span>
        <Badge status="warning" />
        <span>
          待处理{' '}
          {(stats?.total || 0) -
            (stats?.ready || 0) -
            (stats?.processing || 0) -
            (stats?.error || 0)}
        </span>
        <Badge status="processing" />
        <span>处理中 {stats?.processing || 0}</span>
        <Badge status="error" />
        <span>错误 {stats?.error || 0}</span>
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
        locale={{ emptyText: '还没有上传文档或者在项目中创建知识库' }}
      />
    </div>
  );
}
