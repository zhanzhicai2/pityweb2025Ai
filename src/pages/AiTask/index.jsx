import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  message,
  Popconfirm,
  Progress,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { listAITask, deleteAITask, executeAITask } from '@/services/case_v2';
import AiTaskDrawer from './AiTaskDrawer';
import auth from '@/utils/auth';
import { useModel } from '@umijs/max';

const { Text } = Typography;
const { Option } = Select;

const AiTaskPage = () => {
  const { projects } = useModel('project');
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchStatus, setSearchStatus] = useState(null);
  const [searchProject, setSearchProject] = useState(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, size: pageSize };
      if (searchStatus) params.status = searchStatus;
      if (searchProject) params.project_id = searchProject;
      const res = await listAITask(params);
      if (auth.response(res)) {
        setData(res.data || []);
        setTotal(res.total || 0);
      }
    } catch (e) {
      message.error(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, searchStatus, searchProject]);

  // 删除
  const handleDelete = async (id) => {
    try {
      const res = await deleteAITask(id);
      if (auth.response(res)) {
        message.success('删除成功');
        loadData();
      }
    } catch (e) {
      message.error(e.message || '删除失败');
    }
  };

  // 执行
  const handleExecute = async (id) => {
    try {
      const res = await executeAITask(id);
      if (auth.response(res)) {
        message.success('执行已触发');
        loadData();
      }
    } catch (e) {
      message.error(e.message || '执行失败');
    }
  };

  // 状态颜色
  const statusColor = (status) => {
    const colors = {
      pending: 'default',
      parsing: 'processing',
      generating: 'processing',
      completed: 'success',
      failed: 'error',
    };
    return colors[status] || 'default';
  };

  // 状态文本
  const statusText = (status) => {
    const texts = {
      pending: '等待中',
      parsing: '解析中',
      generating: '生成中',
      completed: '已完成',
      failed: '失败',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true,
    },
    {
      title: '项目',
      dataIndex: 'project_id',
      key: 'project_id',
      width: 120,
      render: (pid) => {
        const p = projects?.find((pr) => pr.id === pid);
        return p?.name || pid;
      },
    },
    {
      title: '用例类型',
      dataIndex: 'case_type',
      key: 'case_type',
      width: 80,
      render: (type) => {
        const colors = { api: 'blue', functional: 'green', ui: 'purple' };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status) => <Tag color={statusColor(status)}>{statusText(status)}</Tag>,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress, record) => {
        if (record.status === 'completed' || record.status === 'failed') {
          return `${record.generated_cases || 0}/${record.total_cases || 0}`;
        }
        return <Progress percent={progress || 0} size="small" />;
      },
    },
    {
      title: '需求描述',
      dataIndex: 'requirement',
      key: 'requirement',
      width: 200,
      ellipsis: true,
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditingRecord(record);
              setDrawerVisible(true);
            }}
          >
            {record.status === 'completed' || record.status === 'failed' ? '查看' : '编辑'}
          </Button>
          {record.status !== 'generating' && record.status !== 'parsing' && (
            <Button type="link" size="small" onClick={() => handleExecute(record.id)}>
              执行
            </Button>
          )}
          <Popconfirm
            title="确定删除？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer breadcrumb={null} title={false}>
      <Card>
        <Form layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item label="项目">
            <Select
              placeholder="筛选项目"
              value={searchProject}
              onChange={(val) => {
                setSearchProject(val);
                setPage(1);
              }}
              style={{ width: 150 }}
              allowClear
            >
              {projects?.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="状态">
            <Select
              placeholder="筛选状态"
              value={searchStatus}
              onChange={(val) => {
                setSearchStatus(val);
                setPage(1);
              }}
              style={{ width: 100 }}
              allowClear
            >
              <Option value="pending">等待中</Option>
              <Option value="parsing">解析中</Option>
              <Option value="generating">生成中</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">失败</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              onClick={() => {
                setEditingRecord(null);
                setDrawerVisible(true);
              }}
            >
              新建任务
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      <AiTaskDrawer
        visible={drawerVisible}
        record={editingRecord}
        onClose={() => {
          setDrawerVisible(false);
          setEditingRecord(null);
        }}
        onSuccess={() => {
          setDrawerVisible(false);
          setEditingRecord(null);
          loadData();
        }}
      />
    </PageContainer>
  );
};

export default AiTaskPage;
