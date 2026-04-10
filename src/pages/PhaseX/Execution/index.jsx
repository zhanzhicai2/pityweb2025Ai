import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Tag, Typography, Select, Space, Button, Badge, Drawer } from 'antd';
import React, { useEffect, useState } from 'react';
import { listPhaseXExecution, getPhaseXExecution } from '@/services/phasex';
import auth from '@/utils/auth';
import { useModel } from '@umijs/max';

const { Text } = Typography;
const { Option } = Select;

const PhaseXExecutionPage = () => {
  const { projects = [] } = useModel('project');
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchPlan, setSearchPlan] = useState(null);
  const [searchProject, setSearchProject] = useState(null);
  const [searchStatus, setSearchStatus] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, size: pageSize };
      if (searchPlan) params.plan_id = searchPlan;
      if (searchProject) params.project_id = searchProject;
      if (searchStatus) params.status = searchStatus;
      const res = await listPhaseXExecution(params);
      if (auth.response(res)) {
        setData(res.data || []);
        setTotal(res.total || 0);
      }
    } catch (e) {
      console.error('加载失败', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, searchPlan, searchProject, searchStatus]);

  // 查看详情
  const handleDetail = async (id) => {
    try {
      const res = await getPhaseXExecution(id);
      if (auth.response(res)) {
        setCurrentRecord(res.data);
        setDetailVisible(true);
      }
    } catch (e) {
      console.error('加载详情失败', e);
    }
  };

  // 状态映射
  const statusMap = {
    pending: { color: 'default', text: '待执行' },
    running: { color: 'processing', text: '执行中' },
    passed: { color: 'success', text: '通过' },
    failed: { color: 'error', text: '失败' },
    error: { color: 'warning', text: '错误' },
  };

  const getStatus = (s) => statusMap[s] || { color: 'default', text: s };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '计划',
      dataIndex: 'plan_id',
      key: 'plan_id',
      width: 80,
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => {
        const { color, text } = getStatus(s);
        return <Badge status={color} text={text} />;
      },
    },
    {
      title: '执行人',
      dataIndex: 'executor',
      key: 'executor',
      width: 100,
    },
    {
      title: '耗时',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      width: 100,
      render: (ms) => (ms ? `${ms}ms` : '-'),
    },
    {
      title: '执行时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleDetail(record.id)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <PageContainer breadcrumb={null} title={false}>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
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
            <Option value="pending">待执行</Option>
            <Option value="running">执行中</Option>
            <Option value="passed">通过</Option>
            <Option value="failed">失败</Option>
            <Option value="error">错误</Option>
          </Select>
        </Space>

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

      {/* 详情抽屉 */}
      <Drawer
        title="执行详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={600}
      >
        {currentRecord && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card size="small" title="基本信息">
              <Space direction="vertical">
                <Text>
                  <Text strong>执行ID：</Text>
                  {currentRecord.id}
                </Text>
                <Text>
                  <Text strong>计划ID：</Text>
                  {currentRecord.plan_id}
                </Text>
                <Text>
                  <Text strong>状态：</Text>
                  <Tag color={getStatus(currentRecord.status).color}>
                    {getStatus(currentRecord.status).text}
                  </Tag>
                </Text>
                <Text>
                  <Text strong>执行人：</Text>
                  {currentRecord.executor}
                </Text>
                <Text>
                  <Text strong>耗时：</Text>
                  {currentRecord.duration_ms}ms
                </Text>
                <Text>
                  <Text strong>执行时间：</Text>
                  {currentRecord.created_at}
                </Text>
              </Space>
            </Card>

            {currentRecord.error_message && (
              <Card size="small" title="错误信息">
                <Text type="danger">{currentRecord.error_message}</Text>
              </Card>
            )}

            {currentRecord.response_data && (
              <Card size="small" title="响应数据">
                <pre style={{ maxHeight: 300, overflow: 'auto', fontSize: 12 }}>
                  {typeof currentRecord.response_data === 'string'
                    ? currentRecord.response_data
                    : JSON.stringify(JSON.parse(currentRecord.response_data), null, 2)}
                </pre>
              </Card>
            )}

            {currentRecord.step_results && (
              <Card size="small" title="步骤结果">
                <pre style={{ maxHeight: 300, overflow: 'auto', fontSize: 12 }}>
                  {typeof currentRecord.step_results === 'string'
                    ? currentRecord.step_results
                    : JSON.stringify(JSON.parse(currentRecord.step_results), null, 2)}
                </pre>
              </Card>
            )}
          </Space>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default PhaseXExecutionPage;
