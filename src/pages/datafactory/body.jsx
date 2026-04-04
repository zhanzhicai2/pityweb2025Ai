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
  Empty,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import { useEffect, useState } from 'react';

const { Option } = Select;

export default () => {
  const [categories, setCategories] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [toolList, setToolList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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
      const res = await listRecords({ page: 1, size: 20 });
      if (res.code === 0) {
        setRecords(res.data?.list || []);
      }
    } catch (e) {
      message.error('加载记录失败');
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
    loadRecords();
  }, []);

  // 选择分类
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedTool(null);
    setResult(null);
    if (category && category.tools) {
      setToolList(category.tools);
    } else {
      // 显示所有工具
      const allTools = [];
      categories.forEach((cat) => {
        if (cat.tools) {
          allTools.push(...cat.tools);
        }
      });
      setToolList(allTools);
    }
  };

  // 选择工具
  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setResult(null);
    form.setFieldsValue({ tool_name: tool?.name });
  };

  // 单条生成
  const handleGenerate = async (values) => {
    try {
      setGenerating(true);
      const res = await generateData(values.tool_name, values.params || null);
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
      const res = await batchGenerateData(
        values.tool_name,
        values.count || 10,
        values.params || null,
      );
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
      <Row gutter={16}>
        {/* 左侧工具分类 */}
        <Col span={6}>
          <Card title="工具分类" size="small" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button
                type={!selectedCategory ? 'primary' : 'default'}
                onClick={() => handleCategorySelect(null)}
                block
              >
                全部工具
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.name}
                  type={selectedCategory?.name === cat.name ? 'primary' : 'default'}
                  onClick={() => handleCategorySelect(cat)}
                  block
                >
                  {cat.name} ({cat.tools?.length || 0})
                </Button>
              ))}
            </div>
          </Card>

          <Card title="工具列表" size="small">
            {toolList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {toolList.map((tool) => (
                  <Card.Grid
                    key={tool.name}
                    style={{
                      padding: 8,
                      cursor: 'pointer',
                      background: selectedTool?.name === tool.name ? '#e6f7ff' : '#fff',
                      borderColor: selectedTool?.name === tool.name ? '#1890ff' : '#f0f0f0',
                    }}
                    onClick={() => handleToolSelect(tool)}
                  >
                    <div
                      style={{ fontWeight: selectedTool?.name === tool.name ? 'bold' : 'normal' }}
                    >
                      {tool.display_name}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>{tool.name}</div>
                  </Card.Grid>
                ))}
              </div>
            ) : (
              <Empty description="请选择分类" />
            )}
          </Card>
        </Col>

        {/* 右侧工具面板 */}
        <Col span={18}>
          <Card
            title={selectedTool ? `工具: ${selectedTool.display_name}` : '请选择工具'}
            size="small"
          >
            {selectedTool ? (
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
                      >
                        批量生成
                      </Button>
                    </Form>
                  </Card>
                </Col>

                {/* 结果展示 */}
                <Col span={24} style={{ marginTop: 16 }}>
                  <Card size="small" title="生成结果">
                    {result ? (
                      <pre
                        style={{
                          background: '#f5f5f5',
                          padding: 16,
                          borderRadius: 4,
                          maxHeight: 300,
                          overflow: 'auto',
                        }}
                      >
                        {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
                      </pre>
                    ) : (
                      <Empty description="暂无生成结果" />
                    )}
                  </Card>
                </Col>
              </Row>
            ) : (
              <Empty description="请从左侧选择一个工具" />
            )}
          </Card>

          {/* 使用记录 */}
          <Card title="使用记录" size="small" style={{ marginTop: 16 }}>
            <Table
              columns={columns}
              dataSource={records}
              rowKey="id"
              loading={recordsLoading}
              size="small"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true,
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
