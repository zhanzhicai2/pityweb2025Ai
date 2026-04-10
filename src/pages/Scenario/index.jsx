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
} from 'antd';
import React, { useEffect, useState } from 'react';
import { listScenario, deleteScenario } from '@/services/scenario';
import ScenarioDrawer from './ScenarioDrawer';
import ScenarioStepDrawer from './ScenarioStepDrawer';
import auth from '@/utils/auth';
import { useProject } from '@/utils/useProject';

const { Text } = Typography;
const { Option } = Select;

const ScenarioPage = () => {
  const { projects } = useProject();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [stepDrawerVisible, setStepDrawerVisible] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [searchProject, setSearchProject] = useState(null);
  const [searchCaseType, setSearchCaseType] = useState(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, size: pageSize };
      if (searchProject) params.project_id = searchProject;
      if (searchCaseType) params.case_type = searchCaseType;
      const res = await listScenario(params);
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
  }, [page, pageSize, searchProject, searchCaseType]);

  // 删除
  const handleDelete = async (id) => {
    try {
      const res = await deleteScenario(id);
      if (auth.response(res)) {
        message.success('删除成功');
        loadData();
      }
    } catch (e) {
      message.error(e.message || '删除失败');
    }
  };

  // 用例类型颜色
  const caseTypeColor = (type) => {
    const colors = { api: 'blue', functional: 'green', ui: 'purple' };
    return colors[type] || 'default';
  };

  // 步骤管理
  const handleManageSteps = (record) => {
    setSelectedScenario(record);
    setStepDrawerVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '场景名称',
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
      width: 90,
      render: (type) => <Tag color={caseTypeColor(type)}>{type}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '变量数',
      dataIndex: 'variables',
      key: 'variables',
      width: 80,
      render: (vars) => (vars ? Object.keys(vars).length : 0),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 70,
      render: (active) => (active ? <Tag color="success">启用</Tag> : <Tag>禁用</Tag>),
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
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => handleManageSteps(record)}>
            步骤管理
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

          <Form.Item label="用例类型">
            <Select
              placeholder="筛选类型"
              value={searchCaseType}
              onChange={(val) => {
                setSearchCaseType(val);
                setPage(1);
              }}
              style={{ width: 100 }}
              allowClear
            >
              <Option value="api">API</Option>
              <Option value="functional">功能</Option>
              <Option value="ui">UI</Option>
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
              新建场景
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

      <ScenarioDrawer
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

      <ScenarioStepDrawer
        visible={stepDrawerVisible}
        scenario={selectedScenario}
        onClose={() => {
          setStepDrawerVisible(false);
          setSelectedScenario(null);
        }}
      />
    </PageContainer>
  );
};

export default ScenarioPage;
