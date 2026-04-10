import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Tag, Typography, Row, Col, Progress, Select, Space, Badge } from 'antd';
import React, { useEffect, useState } from 'react';
import { listPhaseXReport } from '@/services/phasex';
import auth from '@/utils/auth';
import { useProject } from '@/utils/useProject';

const { Text } = Typography;
const { Option } = Select;

const PhaseXReportPage = () => {
  const { projects } = useProject();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchProject, setSearchProject] = useState(null);

  // 加载报告列表
  const loadReports = async () => {
    setLoading(true);
    try {
      const params = { page, size: pageSize };
      if (searchProject) params.project_id = searchProject;
      const res = await listPhaseXReport(params);
      if (auth.response(res)) {
        setReports(res.data || []);
        setTotal(res.total || 0);
      }
    } catch (e) {
      console.error('加载报告失败', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [page, pageSize, searchProject]);

  // 计算汇总
  const summary = reports.reduce(
    (acc, r) => ({
      totalRuns: acc.totalRuns + (r.total_runs || 0),
      totalPassed: acc.totalPassed + (r.total_passed || 0),
      totalFailed: acc.totalFailed + (r.total_failed || 0),
      totalError: acc.totalError + (r.total_error || 0),
    }),
    { totalRuns: 0, totalPassed: 0, totalFailed: 0, totalError: 0 },
  );

  const overallPassRate =
    summary.totalRuns > 0 ? ((summary.totalPassed / summary.totalRuns) * 100).toFixed(1) : '0';

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '报告名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
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
      title: '执行次数',
      dataIndex: 'total_runs',
      key: 'total_runs',
      width: 100,
      render: (val) => <Badge count={val} showZero color="blue" />,
    },
    {
      title: '通过',
      dataIndex: 'total_passed',
      key: 'total_passed',
      width: 80,
      render: (val) => <Tag color="success">{val}</Tag>,
    },
    {
      title: '失败',
      dataIndex: 'total_failed',
      key: 'total_failed',
      width: 80,
      render: (val) => <Tag color="error">{val}</Tag>,
    },
    {
      title: '错误',
      dataIndex: 'total_error',
      key: 'total_error',
      width: 80,
      render: (val) => <Tag color="warning">{val}</Tag>,
    },
    {
      title: '通过率',
      dataIndex: 'pass_rate',
      key: 'pass_rate',
      width: 120,
      render: (rate) => {
        const value = parseFloat(rate) || 0;
        return (
          <Progress
            percent={value}
            size="small"
            status={value >= 80 ? 'success' : value >= 60 ? 'normal' : 'exception'}
          />
        );
      },
    },
    {
      title: '平均耗时',
      dataIndex: 'avg_duration_ms',
      key: 'avg_duration_ms',
      width: 100,
      render: (ms) => (ms ? `${ms}ms` : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
    },
  ];

  return (
    <PageContainer breadcrumb={null} title={false}>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">总执行次数</Text>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
                {summary.totalRuns}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">总通过次数</Text>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
                {summary.totalPassed}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">总失败次数</Text>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ff4d4f' }}>
                {summary.totalFailed}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">总错误次数</Text>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#faad14' }}>
                {summary.totalError}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 通过率概览 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Text type="secondary">整体通过率</Text>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{overallPassRate}%</div>
          </Col>
          <Col span={20}>
            <Progress
              percent={parseFloat(overallPassRate)}
              showInfo={false}
              status={
                parseFloat(overallPassRate) >= 80
                  ? 'success'
                  : parseFloat(overallPassRate) >= 60
                  ? 'normal'
                  : 'exception'
              }
              strokeColor={
                parseFloat(overallPassRate) >= 80
                  ? '#52c41a'
                  : parseFloat(overallPassRate) >= 60
                  ? '#1890ff'
                  : '#ff4d4f'
              }
            />
            <Space style={{ marginTop: 8 }}>
              <Tag color="success">通过 {summary.totalPassed}</Tag>
              <Tag color="error">失败 {summary.totalFailed}</Tag>
              <Tag color="warning">错误 {summary.totalError}</Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 报告列表 */}
      <Card>
        <Space style={{ marginBottom: 16 }}>
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
        </Space>

        <Table
          columns={columns}
          dataSource={reports}
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
    </PageContainer>
  );
};

export default PhaseXReportPage;
