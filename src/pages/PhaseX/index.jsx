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
  Typography,
  Badge,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { listPhaseXPlan, deletePhaseXPlan, executePhaseXPlan } from '@/services/phasex';
import { listScenario } from '@/services/scenario';
import { listCase } from '@/services/case_v2';
import PhaseXDrawer from './PhaseXDrawer';
import auth from '@/utils/auth';
import { useModel } from '@umijs/max';

const { Text } = Typography;
const { Option } = Select;

const PhaseXPage = () => {
  const { projects = [] } = useModel('project');
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchProject, setSearchProject] = useState(null);
  const [searchPlanType, setSearchPlanType] = useState(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, size: pageSize };
      if (searchProject) params.project_id = searchProject;
      if (searchPlanType) params.plan_type = searchPlanType;
      const res = await listPhaseXPlan(params);
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
  }, [page, pageSize, searchProject, searchPlanType]);

  // 删除
  const handleDelete = async (id) => {
    try {
      const res = await deletePhaseXPlan(id);
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
      const res = await executePhaseXPlan(id);
      if (auth.response(res)) {
        message.success('执行已触发');
      }
    } catch (e) {
      message.error(e.message || '执行失败');
    }
  };

  // 计划类型
  const planTypeText = (type) => {
    const texts = { single: '单个用例', scenario: '场景流程', suite: '测试套件' };
    return texts[type] || type;
  };

  const planTypeColor = (type) => {
    const colors = { single: 'blue', scenario: 'green', suite: 'purple' };
    return colors[type] || 'default';
  };

  // 状态
  const statusColor = (active) => (active ? 'success' : 'default');
  const statusText = (active) => (active ? '启用' : '禁用');

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '计划名称',
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
      title: '执行类型',
      dataIndex: 'plan_type',
      key: 'plan_type',
      width: 100,
      render: (type) => <Tag color={planTypeColor(type)}>{planTypeText(type)}</Tag>,
    },
    {
      title: '目标',
      dataIndex: 'target_name',
      key: 'target_name',
      width: 150,
      ellipsis: true,
      render: (text, record) => text || `ID: ${record.target_id}`,
    },
    {
      title: 'Cron',
      dataIndex: 'cron_expression',
      key: 'cron_expression',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '周期',
      dataIndex: 'is_periodic',
      key: 'is_periodic',
      width: 80,
      render: (val) => (val ? <Tag color="cyan">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 70,
      render: (active) => (
        <Badge status={active ? 'success' : 'default'} text={statusText(active)} />
      ),
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
      width: 220,
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
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => handleExecute(record.id)}>
            执行
          </Button>
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

          <Form.Item label="执行类型">
            <Select
              placeholder="筛选类型"
              value={searchPlanType}
              onChange={(val) => {
                setSearchPlanType(val);
                setPage(1);
              }}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="single">单个用例</Option>
              <Option value="scenario">场景流程</Option>
              <Option value="suite">测试套件</Option>
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
              新建计划
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

      <PhaseXDrawer
        visible={drawerVisible}
        record={editingRecord}
        projects={projects}
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

export default PhaseXPage;
