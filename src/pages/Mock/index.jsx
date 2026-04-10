import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';

const { Text } = Typography;
import React, { useEffect, useState } from 'react';
import { listMockRule, deleteMockRule, toggleMockRule } from '@/services/mock';
import { listProject } from '@/services/project';
import auth from '@/utils/auth';
import MockDrawer from './MockDrawer';

const { Option } = Select;

const MockPage = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [projects, setProjects] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchMethod, setSearchMethod] = useState(null);
  const [form] = Form.useForm();

  // 加载项目列表
  const loadProjects = async () => {
    const res = await listProject({ page: 1, size: 10000 });
    if (auth.response(res)) {
      setProjects(Array.isArray(res.data) ? res.data : []);
    }
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, size: pageSize };
      if (searchName) params.name = searchName;
      if (searchMethod) params.method = searchMethod;
      const res = await listMockRule(params);
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
    loadProjects();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, pageSize, searchName, searchMethod]);

  // 搜索
  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    setSearchName('');
    setSearchMethod(null);
    setPage(1);
  };

  // 新增
  const handleAdd = () => {
    setEditingRecord(null);
    setDrawerVisible(true);
  };

  // 编辑
  const handleEdit = (record) => {
    setEditingRecord(record);
    setDrawerVisible(true);
  };

  // 删除
  const handleDelete = async (id) => {
    try {
      const res = await deleteMockRule(id);
      if (auth.response(res)) {
        message.success('删除成功');
        loadData();
      }
    } catch (e) {
      message.error(e.message || '删除失败');
    }
  };

  // 切换状态
  const handleToggle = async (id, checked) => {
    try {
      const res = await toggleMockRule(id, checked);
      if (auth.response(res)) {
        message.success('更新成功');
        loadData();
      }
    } catch (e) {
      message.error(e.message || '更新失败');
    }
  };

  // 关闭抽屉
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setEditingRecord(null);
  };

  // 抽屉保存成功
  const handleDrawerSuccess = () => {
    setDrawerVisible(false);
    setEditingRecord(null);
    loadData();
  };

  // 方法颜色
  const methodColor = (method) => {
    const colors = {
      GET: 'green',
      POST: 'blue',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple',
    };
    return colors[method?.toUpperCase()] || 'default';
  };

  const columns = [
    {
      title: '规则名称',
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
        const p = projects.find((pr) => pr.id === pid);
        return p?.name || pid;
      },
    },
    {
      title: 'URL 模式',
      dataIndex: 'url_pattern',
      key: 'url_pattern',
      width: 200,
      ellipsis: true,
      render: (v) => <Text code>{v}</Text>,
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 80,
      render: (method) => <Tag color={methodColor(method)}>{method}</Tag>,
    },
    {
      title: '状态码',
      dataIndex: 'response_status',
      key: 'response_status',
      width: 80,
    },
    {
      title: '延迟',
      dataIndex: 'response_delay',
      key: 'response_delay',
      width: 80,
      render: (v) => (v > 0 ? `${v}ms` : '-'),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (isActive, record) => (
        <Switch checked={isActive} onChange={(checked) => handleToggle(record.id, checked)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
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
        <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="name">
            <Input
              placeholder="规则名称"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 150 }}
              allowClear
            />
          </Form.Item>
          <Form.Item name="method">
            <Select
              placeholder="请求方法"
              value={searchMethod}
              onChange={(val) => setSearchMethod(val)}
              style={{ width: 100 }}
              allowClear
            >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
              <Option value="PATCH">PATCH</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
          <Form.Item style={{ marginLeft: 'auto' }}>
            <Button type="primary" onClick={handleAdd}>
              新增规则
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

      <MockDrawer
        visible={drawerVisible}
        record={editingRecord}
        projects={projects}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </PageContainer>
  );
};

export default MockPage;
