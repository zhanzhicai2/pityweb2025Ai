import React, { useState } from 'react';
import { Button, Empty, Input, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import { UploadOutlined, ReloadOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import moment from 'moment';

function formatFileSize(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const FILE_TYPE_COLORS = {
  pdf: 'red',
  docx: 'blue',
  doc: 'blue',
  md: 'orange',
  txt: 'default',
};

export default function RequirementTable({
  currentItem,
  files,
  loading,
  searchKeyword,
  onSearchKeywordChange,
  onSearch,
  onReset,
  onUpload,
  onRefresh,
  onDeleteFile,
}) {
  if (!currentItem) {
    return <Empty description="请选择左侧需求文档" style={{ marginTop: 100 }} />;
  }

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (id) => id,
    },
    {
      title: '文件名',
      dataIndex: 'file_name',
      key: 'file_name',
      ellipsis: true,
      render: (name) => (
        <Tooltip title={name}>
          <span>{name}</span>
        </Tooltip>
      ),
    },
    {
      title: '类型',
      dataIndex: 'file_type',
      key: 'file_type',
      width: 80,
      render: (type) => (
        <Tag color={FILE_TYPE_COLORS[type] || 'default'}>{type ? type.toUpperCase() : '-'}</Tag>
      ),
    },
    {
      title: '大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 80,
      render: (size) => formatFileSize(size),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc) => (
        <Tooltip title={desc}>
          <span>{desc || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '下载次数',
      dataIndex: 'download_count',
      key: 'download_count',
      width: 90,
      render: (count) => count || 0,
    },
    {
      title: '公开状态',
      dataIndex: 'is_public',
      key: 'is_public',
      width: 90,
      render: (isPublic) => (
        <Tag color={isPublic ? 'green' : 'default'}>{isPublic ? '公开' : '私有'}</Tag>
      ),
    },
    {
      title: '上传者',
      dataIndex: 'create_user',
      key: 'create_user',
      width: 80,
      render: (user) => `用户${user}`,
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (time) => (time ? moment(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm title="确定删除该文件？" onConfirm={() => onDeleteFile?.(record.id)}>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // 前端关键词过滤
  const keyword = (searchKeyword || '').toLowerCase();
  const dataSource = keyword
    ? (files || []).filter(
        (f) =>
          (f.file_name || '').toLowerCase().includes(keyword) ||
          (f.description || '').toLowerCase().includes(keyword),
      )
    : files || [];

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
          gap: 12,
        }}
      >
        <Space size="middle">
          <Input.Search
            placeholder="搜索文件名/描述"
            value={searchKeyword}
            onChange={(e) => onSearchKeywordChange(e.target.value)}
            onSearch={() => onSearch?.(searchKeyword)}
            style={{ width: 260 }}
            allowClear
          />
          <Button icon={<SearchOutlined />} onClick={() => onSearch?.(searchKeyword)}>
            查询
          </Button>
          <Button icon={<UndoOutlined />} onClick={onReset}>
            重置
          </Button>
        </Space>
        <Space size="middle">
          <Button icon={<ReloadOutlined />} onClick={onRefresh}>
            刷新
          </Button>
          <Button type="primary" icon={<UploadOutlined />} onClick={onUpload}>
            上传文档
          </Button>
        </Space>
      </div>

      {/* 文件表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        size="small"
        locale={{ emptyText: '暂无文件，点击右上角"上传文档"添加' }}
      />
    </div>
  );
}
