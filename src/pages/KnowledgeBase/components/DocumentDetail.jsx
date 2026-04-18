import React from 'react';
import { Alert, Badge, Descriptions, Drawer, Tag } from 'antd';
import moment from 'moment';

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

export default function DocumentDetail({ visible, data, onClose }) {
  if (!data) return null;

  const statusInfo = STATUS_MAP[data.status] || { text: data.status, status: 'default' };

  return (
    <Drawer title="文档详情" width={640} open={visible} onClose={onClose} destroyOnClose>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="文档名称" span={2}>
          {data.name}
        </Descriptions.Item>
        <Descriptions.Item label="文件类型">
          <Tag>{data.file_type}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="文件大小">{formatFileSize(data.file_size)}</Descriptions.Item>
        <Descriptions.Item label="分块数量">{data.chunk_count || 0}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Badge status={statusInfo.status} text={statusInfo.text} />
        </Descriptions.Item>
        <Descriptions.Item label="上传时间" span={2}>
          {data.created_at ? moment(data.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </Descriptions.Item>
        {data.status === 'error' && data.error_msg && (
          <Descriptions.Item label="错误信息" span={2}>
            <Alert type="error" message={data.error_msg} showIcon />
          </Descriptions.Item>
        )}
      </Descriptions>

      <div style={{ marginTop: 16 }}>
        <h4>分块预览</h4>
        <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>
          共 {data.chunk_count || 0} 个分块，预览功能开发中...
        </div>
      </div>
    </Drawer>
  );
}
