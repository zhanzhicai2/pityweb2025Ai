import {
  Card,
  Col,
  Descriptions,
  Progress,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Button,
  Empty,
  Switch,
  Select,
} from 'antd';
import React, { useEffect, useState, useCallback } from 'react';
import { getServerMonitorInfo } from '@/services/monitor';
import auth from '@/utils/auth';

const { Text } = Typography;

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getCpuTagType = (percentage) => {
  if (percentage < 50) return 'success';
  if (percentage < 80) return 'warning';
  return 'danger';
};

const getMemoryTagType = (percentage) => {
  if (percentage < 60) return 'success';
  if (percentage < 85) return 'warning';
  return 'danger';
};

const getProgressStatus = (percent) => {
  if (percent > 80) return 'exception';
  if (percent > 60) return 'active';
  return 'success';
};

const { Option } = Select;

const INTERVAL_OPTIONS = [
  { label: '30秒', value: 30000 },
  { label: '1分钟', value: 60000 },
  { label: '5分钟', value: 300000 },
  { label: '10分钟', value: 600000 },
];

const MonitorPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(600000);
  const [timer, setTimer] = useState(null);

  const loadData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await getServerMonitorInfo();
      if (auth.response(res)) {
        setData(res.data);
      }
    } catch (e) {
      console.error('获取监控数据失败:', e);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // 设置定时器
  useEffect(() => {
    if (timer) {
      clearInterval(timer);
    }
    if (autoRefresh) {
      const newTimer = setInterval(loadData, refreshInterval);
      setTimer(newTimer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefresh, refreshInterval]);

  // 初始加载
  useEffect(() => {
    loadData();
  }, []);

  if (!data && loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <Empty description="暂无数据">
          <Button type="primary" onClick={loadData}>
            刷新
          </Button>
        </Empty>
      </Card>
    );
  }

  const { server_info, cpu_info, memory_info, disk_info, network_info, top_processes } = data;

  const diskColumns = [
    { title: '设备', dataIndex: 'device', key: 'device', ellipsis: true },
    { title: '挂载点', dataIndex: 'mountpoint', key: 'mountpoint', ellipsis: true },
    { title: '文件系统', dataIndex: 'fstype', key: 'fstype', align: 'center' },
    {
      title: '使用率',
      dataIndex: 'usage_percent',
      key: 'usage_percent',
      align: 'center',
      width: 180,
      render: (val) => <Progress percent={val} size="small" status={getProgressStatus(val)} />,
    },
    {
      title: '总大小',
      dataIndex: 'total',
      key: 'total',
      align: 'center',
      render: (val) => formatBytes(val),
    },
    {
      title: '已用',
      dataIndex: 'used',
      key: 'used',
      align: 'center',
      render: (val) => formatBytes(val),
    },
    {
      title: '可用',
      dataIndex: 'free',
      key: 'free',
      align: 'center',
      render: (val) => formatBytes(val),
    },
  ];

  const networkColumns = [
    { title: '网络接口', dataIndex: 'interface', key: 'interface' },
    {
      title: '发送字节',
      dataIndex: 'bytes_sent',
      key: 'bytes_sent',
      align: 'center',
      render: (val) => formatBytes(val),
    },
    {
      title: '接收字节',
      dataIndex: 'bytes_recv',
      key: 'bytes_recv',
      align: 'center',
      render: (val) => formatBytes(val),
    },
    { title: '发送包', dataIndex: 'packets_sent', key: 'packets_sent', align: 'center' },
    { title: '接收包', dataIndex: 'packets_recv', key: 'packets_recv', align: 'center' },
    { title: '发送错误', dataIndex: 'errout', key: 'errout', align: 'center' },
    { title: '接收错误', dataIndex: 'errin', key: 'errin', align: 'center' },
  ];

  const processColumns = [
    { title: 'PID', dataIndex: 'pid', key: 'pid', width: 80, align: 'center' },
    { title: '进程名', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '用户', dataIndex: 'username', key: 'username' },
    { title: '状态', dataIndex: 'status', key: 'status', align: 'center', width: 80 },
    {
      title: 'CPU%',
      dataIndex: 'cpu_percent',
      key: 'cpu_percent',
      width: 90,
      align: 'center',
      render: (val) => <Tag color={getCpuTagType(val)}>{val}%</Tag>,
    },
    {
      title: '内存%',
      dataIndex: 'memory_percent',
      key: 'memory_percent',
      width: 90,
      align: 'center',
      render: (val) => <Tag color={getMemoryTagType(val)}>{val}%</Tag>,
    },
    {
      title: '内存使用',
      dataIndex: 'memory_info',
      key: 'memory_info',
      align: 'center',
      render: (val) => formatBytes(val),
    },
    { title: '创建时间', dataIndex: 'create_time', key: 'create_time' },
    { title: '命令行', dataIndex: 'cmdline', key: 'cmdline', ellipsis: true },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <span>自动刷新：</span>
          <Switch checked={autoRefresh} onChange={setAutoRefresh} />
          <span>刷新间隔：</span>
          <Select
            value={refreshInterval}
            onChange={setRefreshInterval}
            style={{ width: 100 }}
            disabled={!autoRefresh}
          >
            {INTERVAL_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
          <Button onClick={loadData}>立即刷新</Button>
          <Text type="secondary">数据更新时间：{data?.timestamp || '-'}</Text>
        </Space>
      </Card>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* CPU 和 内存 */}
        <Row gutter={16}>
          <Col span={12}>
            <Card loading={loading} title={'CPU使用情况'}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">核心数</Text>
                    <Progress
                      type="circle"
                      percent={100}
                      format={() => cpu_info?.logical_cores}
                      size={120}
                    />
                    <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
                      <Descriptions.Item label="物理核心">
                        {cpu_info?.physical_cores}
                      </Descriptions.Item>
                      <Descriptions.Item label="逻辑核心">
                        {cpu_info?.logical_cores}
                      </Descriptions.Item>
                      <Descriptions.Item label="当前频率">
                        {cpu_info?.current_frequency?.toFixed(0)} MHz
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">使用率</Text>
                    <Progress
                      type="circle"
                      percent={cpu_info?.usage_percent || 0}
                      status={getProgressStatus(cpu_info?.usage_percent)}
                      size={120}
                    />
                    <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
                      <Descriptions.Item label="CPU使用率">
                        {cpu_info?.usage_percent?.toFixed(1)}%
                      </Descriptions.Item>
                      <Descriptions.Item label="最大频率">
                        {cpu_info?.max_frequency?.toFixed(0)} MHz
                      </Descriptions.Item>
                      <Descriptions.Item label="最小频率">
                        {cpu_info?.min_frequency?.toFixed(0)} MHz
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={12}>
            <Card loading={loading} title={'内存使用情况'}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">系统内存</Text>
                    <Progress
                      type="circle"
                      percent={memory_info?.usage_percent || 0}
                      status={getProgressStatus(memory_info?.usage_percent)}
                      size={120}
                    />
                    <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
                      <Descriptions.Item label="总内存">
                        {formatBytes(memory_info?.total)}
                      </Descriptions.Item>
                      <Descriptions.Item label="已用内存">
                        {formatBytes(memory_info?.used)}
                      </Descriptions.Item>
                      <Descriptions.Item label="可用内存">
                        {formatBytes(memory_info?.available)}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">交换分区</Text>
                    <Progress
                      type="circle"
                      percent={memory_info?.swap_percent || 0}
                      status={getProgressStatus(memory_info?.swap_percent)}
                      size={120}
                    />
                    <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
                      <Descriptions.Item label="总大小">
                        {formatBytes(memory_info?.swap_total)}
                      </Descriptions.Item>
                      <Descriptions.Item label="已用">
                        {formatBytes(memory_info?.swap_used)}
                      </Descriptions.Item>
                      <Descriptions.Item label="空闲">
                        {formatBytes(memory_info?.swap_free)}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* 服务器基本信息 */}
        <Card loading={loading} title={'服务器基本信息'}>
          <Descriptions bordered column={3}>
            <Descriptions.Item label="主机名">{server_info?.hostname}</Descriptions.Item>
            <Descriptions.Item label="操作系统">{server_info?.platform}</Descriptions.Item>
            <Descriptions.Item label="系统架构">{server_info?.architecture}</Descriptions.Item>
            <Descriptions.Item label="处理器">{server_info?.processor}</Descriptions.Item>
            <Descriptions.Item label="启动时间">{server_info?.boot_time}</Descriptions.Item>
            <Descriptions.Item label="运行时长">{server_info?.uptime}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 磁盘使用情况 */}
        <Card loading={loading} title={'磁盘使用情况'}>
          <Table
            columns={diskColumns}
            dataSource={disk_info}
            rowKey="mountpoint"
            pagination={false}
            size="small"
          />
        </Card>

        {/* 网络使用情况 */}
        <Card loading={loading} title={'网络使用情况'}>
          <Table
            columns={networkColumns}
            dataSource={network_info}
            rowKey="interface"
            pagination={false}
            size="small"
          />
        </Card>

        {/* Top 进程 */}
        <Card loading={loading} title={'Top 进程'}>
          <Table
            columns={processColumns}
            dataSource={top_processes}
            rowKey="pid"
            pagination={false}
            size="small"
          />
        </Card>
      </Space>
    </div>
  );
};

export default MonitorPage;
