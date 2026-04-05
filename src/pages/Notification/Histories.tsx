import { deleteHistory, listHistories } from '@/services/webhook';
import { DeleteOutlined } from '@ant-design/icons';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Button, message, Popconfirm, Tag } from 'antd';
import { useRef } from 'react';

const statusOptions = [
  { label: '待发送', value: 'pending' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
];

const statusColors: Record<string, string> = {
  pending: 'default',
  success: 'success',
  failed: 'error',
};

const HistoryList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteHistory(id);
      if (res.code === 0) {
        message.success('删除成功');
        actionRef.current?.reload();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_: any, record: any) => (
        <Tag color={statusColors[record.status] || 'default'}>
          {statusOptions.find((s) => s.value === record.status)?.label || record.status}
        </Tag>
      ),
    },
    {
      title: '错误信息',
      dataIndex: 'error_message',
      key: 'error_message',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '发送时间',
      dataIndex: 'sent_at',
      key: 'sent_at',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      valueType: 'option',
      render: (_: any, record: any) => (
        <Popconfirm
          title="确认删除"
          description="确定要删除这条历史记录吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确认"
          cancelText="取消"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <ProTable
      headerTitle="通知发送历史"
      actionRef={actionRef}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      options={false}
      request={async (params) => {
        const res = await listHistories({
          config_id: params.config_id,
          status: params.status,
          days: params.days || 7,
          skip: 0,
          limit: 100,
        });
        return {
          data: res.data?.list || [],
          total: res.data?.total || 0,
          success: res.code === 0,
        };
      }}
      columns={columns}
      rowSelection={false}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
      }}
    />
  );
};

export default HistoryList;
