import React, { useEffect } from 'react';
import { Spin, Tag, Button, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const statusMap = {
  PENDING: { color: 'default', text: '等待中' },
  STARTED: { color: 'processing', text: '进行中' },
  SUCCESS: { color: 'success', text: '成功' },
  FAILURE: { color: 'error', text: '失败' },
  RETRY: { color: 'warning', text: '重试中' },
  REVOKED: { color: 'default', text: '已取消' },
};

export default function TaskStatus({ taskId, taskStatus, taskResult, onPoll, onClear }) {
  const statusInfo = statusMap[taskStatus] || { color: 'default', text: taskStatus || '未知' };
  const isFinished =
    taskStatus === 'SUCCESS' || taskStatus === 'FAILURE' || taskStatus === 'REVOKED';

  useEffect(() => {
    if (!taskId || isFinished) return;
    const timer = setTimeout(() => {
      onPoll?.(taskId);
    }, 2000);
    return () => clearTimeout(timer);
  }, [taskId, taskStatus, isFinished, onPoll]);

  if (!taskId) return null;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>任务状态：</span>
        <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        {!isFinished && <LoadingOutlined spin />}
        {isFinished && (
          <Button size="small" onClick={onClear}>
            清除
          </Button>
        )}
      </div>

      {taskStatus === 'FAILURE' && taskResult?.error && (
        <Alert type="error" message={taskResult.error} showIcon />
      )}

      {taskStatus === 'SUCCESS' && taskResult && (
        <Alert type="success" message="任务执行成功" showIcon />
      )}
    </div>
  );
}
