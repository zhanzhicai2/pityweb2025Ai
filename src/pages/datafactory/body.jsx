import {
  batchGenerateData,
  deleteRecord,
  favoriteRecord,
  generateData,
  listRecords,
  listTools,
} from '@/services/dataPool';
import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import { useEffect, useState } from 'react';

const { Option } = Select;

// 分类图标映射
const categoryIcons = {
  test_data: 'User',
  json: 'FileText',
  string: 'Edit',
  encoding: 'Lock',
  random: 'Reload',
  encryption: 'Key',
  crontab: 'Clock',
};

// 分类颜色映射
const categoryColors = {
  test_data: '#667eea',
  json: '#f5576c',
  string: '#4facfe',
  encoding: '#43e97b',
  random: '#fa709a',
  encryption: '#a8edea',
  crontab: '#ff9a9e',
};

export default () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [toolDrawerVisible, setToolDrawerVisible] = useState(false);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [stats, setStats] = useState({});
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

  // 加载工具列表
  const loadTools = async () => {
    try {
      setLoading(true);
      const res = await listTools();
      if (res.code === 0) {
        setCategories(res.data || []);
      }
    } catch (e) {
      message.error('加载工具列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载使用记录
  const loadRecords = async () => {
    try {
      setRecordsLoading(true);
      const res = await listRecords({ page: 1, size: 100 });
      if (res.code === 0) {
        setRecords(res.data?.list || []);
      }
    } catch (e) {
      message.error('加载记录失败');
    } finally {
      setRecordsLoading(false);
    }
  };

  // 计算统计数据
  const calculateStats = () => {
    const statsData = {
      total: records.length,
      byCategory: {},
      byTool: {},
    };

    records.forEach((r) => {
      statsData.byCategory[r.tool_category] = (statsData.byCategory[r.tool_category] || 0) + 1;
      statsData.byTool[r.tool_name] = (statsData.byTool[r.tool_name] || 0) + 1;
    });

    setStats(statsData);
  };

  useEffect(() => {
    loadTools();
    loadRecords();
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      calculateStats();
    }
  }, [records]);

  // 选择分类
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedTool(null);
    setResult(null);
    setToolDrawerVisible(true);
  };

  // 选择工具
  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setResult(null);
    form.setFieldsValue({ tool_name: tool.name });
    batchForm.setFieldsValue({ tool_name: tool.name, count: 10 });
  };

  // 单条生成
  const handleGenerate = async (values) => {
    try {
      setGenerating(true);
      const params = values.params ? JSON.parse(values.params) : null;
      const res = await generateData(values.tool_name, params);
      if (res.code === 0) {
        setResult(res.data?.result);
        message.success('生成成功');
        loadRecords();
      } else {
        message.error(res.msg || '生成失败');
      }
    } catch (e) {
      message.error('生成失败');
    } finally {
      setGenerating(false);
    }
  };

  // 批量生成
  const handleBatchGenerate = async (values) => {
    try {
      setGenerating(true);
      const params = values.params ? JSON.parse(values.params) : null;
      const res = await batchGenerateData(values.tool_name, values.count || 10, params);
      if (res.code === 0) {
        setResult(res.data);
        message.success(`成功生成 ${res.data?.length || 0} 条数据`);
        loadRecords();
      } else {
        message.error(res.msg || '生成失败');
      }
    } catch (e) {
      message.error('生成失败');
    } finally {
      setGenerating(false);
    }
  };

  // 删除记录
  const handleDelete = async (id) => {
    try {
      const res = await deleteRecord(id);
      if (res.code === 0) {
        message.success('删除成功');
        loadRecords();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  // 收藏/取消收藏
  const handleFavorite = async (record) => {
    try {
      const res = await favoriteRecord(record.id, !record.is_favorite);
      if (res.code === 0) {
        message.success(record.is_favorite ? '已取消收藏' : '已收藏');
        loadRecords();
      } else {
        message.error(res.msg || '操作失败');
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '工具名称',
      dataIndex: 'tool_name',
      key: 'tool_name',
      width: 120,
    },
    {
      title: '分类',
      dataIndex: 'tool_category',
      key: 'tool_category',
      width: 100,
      render: (cat) => <Tag color={categoryColors[cat] || 'blue'}>{cat}</Tag>,
    },
    {
      title: '生成结果',
      dataIndex: 'output_data',
      key: 'output_data',
      ellipsis: true,
    },
    {
      title: '收藏',
      dataIndex: 'is_favorite',
      key: 'is_favorite',
      width: 80,
      render: (isFavorite) => (
        <Tag color={isFavorite ? 'gold' : 'default'}>{isFavorite ? '已收藏' : '未收藏'}</Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleFavorite(record)}>
            {record.is_favorite ? '取消收藏' : '收藏'}
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="data-factory">
      {/* 页面头部 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div className="page-header">
          <div className="header-left">
            <h2 style={{ margin: 0, fontSize: 24 }}>数据池</h2>
            <p style={{ margin: '8px 0 0', color: '#666' }}>
              提供测试数据生成工具，助力测试数据准备
            </p>
          </div>
          <div className="header-right">
            <Button onClick={() => setHistoryDrawerVisible(true)}>使用记录</Button>
            <Button type="primary" onClick={() => setStatsModalVisible(true)}>
              统计信息
            </Button>
          </div>
        </div>
      </Card>

      {/* 分类卡片 */}
      <Row gutter={[16, 16]}>
        {categories.map((cat) => (
          <Col xs={24} sm={12} md={8} lg={6} key={cat.name}>
            <Card
              hoverable
              onClick={() => handleCategorySelect(cat)}
              style={{
                borderLeft: `4px solid ${categoryColors[cat.name] || '#667eea'}`,
              }}
              bodyStyle={{ padding: 16 }}
            >
              <div className="category-content">
                <div
                  className="category-icon"
                  style={{ background: categoryColors[cat.name] || '#667eea' }}
                >
                  {cat.name}
                </div>
                <div className="category-info">
                  <h3 style={{ margin: 0, fontSize: 16 }}>{cat.name}</h3>
                  <p style={{ margin: '4px 0 0', color: '#999', fontSize: 12 }}>
                    {cat.tools?.length || 0} 个工具
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 工具列表抽屉 */}
      <Drawer
        title={selectedCategory?.name || '工具列表'}
        placement="right"
        width={600}
        open={toolDrawerVisible}
        onClose={() => {
          setToolDrawerVisible(false);
          setSelectedTool(null);
        }}
      >
        {selectedCategory && (
          <div className="tool-list">
            <Input.Search
              placeholder="搜索工具..."
              style={{ marginBottom: 16 }}
              onSearch={(value) => {
                // 简单过滤
                const filtered = selectedCategory.tools?.filter((t) =>
                  t.display_name.toLowerCase().includes(value.toLowerCase()),
                );
                if (filtered) {
                  setSelectedCategory({ ...selectedCategory, tools: filtered });
                }
              }}
            />

            <Row gutter={[12, 12]}>
              {(selectedCategory.tools || []).map((tool) => (
                <Col span={12} key={tool.name}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => handleToolSelect(tool)}
                    style={{
                      background: selectedTool?.name === tool.name ? '#e6f7ff' : '#fafafa',
                      borderColor: selectedTool?.name === tool.name ? '#1890ff' : '#f0f0f0',
                    }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <div
                      style={{ fontWeight: selectedTool?.name === tool.name ? 'bold' : 'normal' }}
                    >
                      {tool.display_name}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>{tool.name}</div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 工具执行面板 */}
            {selectedTool && (
              <Card
                size="small"
                style={{ marginTop: 16 }}
                title={`工具: ${selectedTool.display_name}`}
              >
                <Row gutter={16}>
                  {/* 单条生成 */}
                  <Col span={12}>
                    <Card size="small" title="单条生成">
                      <Form form={form} layout="vertical" onFinish={handleGenerate}>
                        <Form.Item name="tool_name" hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item label="参数(可选)" name="params">
                          <Input.TextArea placeholder='例如: {"gender": "male"}' rows={2} />
                        </Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={generating}
                          disabled={generating}
                          block
                        >
                          生成
                        </Button>
                      </Form>
                    </Card>
                  </Col>

                  {/* 批量生成 */}
                  <Col span={12}>
                    <Card size="small" title="批量生成">
                      <Form form={batchForm} layout="vertical" onFinish={handleBatchGenerate}>
                        <Form.Item name="tool_name" hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item label="数量" name="count" initialValue={10}>
                          <Select>
                            <Option value={5}>5条</Option>
                            <Option value={10}>10条</Option>
                            <Option value={20}>20条</Option>
                            <Option value={50}>50条</Option>
                            <Option value={100}>100条</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label="参数(可选)" name="params">
                          <Input.TextArea placeholder='例如: {"gender": "male"}' rows={2} />
                        </Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={generating}
                          disabled={generating}
                          block
                        >
                          批量生成
                        </Button>
                      </Form>
                    </Card>
                  </Col>
                </Row>

                {/* 结果展示 */}
                <div style={{ marginTop: 16 }}>
                  <h4>生成结果</h4>
                  {result ? (
                    <pre
                      style={{
                        background: '#f5f5f5',
                        padding: 12,
                        borderRadius: 4,
                        maxHeight: 300,
                        overflow: 'auto',
                        fontSize: 12,
                      }}
                    >
                      {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
                    </pre>
                  ) : (
                    <Empty description="暂无生成结果" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* 使用记录抽屉 */}
      <Drawer
        title="使用记录"
        placement="right"
        width={800}
        open={historyDrawerVisible}
        onClose={() => setHistoryDrawerVisible(false)}
      >
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={recordsLoading}
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Drawer>

      {/* 统计弹窗 */}
      <Modal
        title="使用统计"
        open={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="stats-content">
          <Card size="small" style={{ marginBottom: 16 }}>
            <h3>总使用次数</h3>
            <Progress percent={100} format={() => stats.total || 0} />
          </Card>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small" title="按分类统计">
                {Object.entries(stats.byCategory || {}).map(([cat, count]) => (
                  <div key={cat} style={{ marginBottom: 8 }}>
                    <Tag color={categoryColors[cat] || 'blue'}>{cat}</Tag>
                    <span>{count} 次</span>
                  </div>
                ))}
                {Object.keys(stats.byCategory || {}).length === 0 && (
                  <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="按工具统计">
                {Object.entries(stats.byTool || {}).map(([tool, count]) => (
                  <div key={tool} style={{ marginBottom: 8 }}>
                    <span>{tool}</span>
                    <span style={{ color: '#999', marginLeft: 8 }}>{count} 次</span>
                  </div>
                ))}
                {Object.keys(stats.byTool || {}).length === 0 && (
                  <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
    </div>
  );
};
