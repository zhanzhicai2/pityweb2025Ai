import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tabs,
  Table,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { listTemplate, deleteTemplate, listCase, deleteCase, getCase } from '@/services/case_v2';
import CaseTemplateDrawer from './CaseV2Drawer';
import auth from '@/utils/auth';

const { Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const CaseV2Page = () => {
  // Tab 控制
  const [activeTab, setActiveTab] = useState('template');

  // 模板相关
  const [templateList, setTemplateList] = useState([]);
  const [templateTotal, setTemplateTotal] = useState(0);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templatePage, setTemplatePage] = useState(1);
  const [templatePageSize, setTemplatePageSize] = useState(10);
  const [templateDrawerVisible, setTemplateDrawerVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // 用例相关
  const [caseList, setCaseList] = useState([]);
  const [caseTotal, setCaseTotal] = useState(0);
  const [caseLoading, setCaseLoading] = useState(false);
  const [casePage, setCasePage] = useState(1);
  const [casePageSize, setCasePageSize] = useState(10);
  const [caseDrawerVisible, setCaseDrawerVisible] = useState(false);
  const [editingCase, setEditingCase] = useState(null);

  // 用例详情抽屉
  const [caseDetailVisible, setCaseDetailVisible] = useState(false);
  const [caseDetail, setCaseDetail] = useState(null);

  // 搜索筛选
  const [searchType, setSearchType] = useState(null);
  const [searchStatus, setSearchStatus] = useState(null);

  // 加载模板列表
  const loadTemplates = async () => {
    setTemplateLoading(true);
    try {
      const params = { page: templatePage, size: templatePageSize };
      if (searchType) params.test_type = searchType;
      const res = await listTemplate(params);
      if (auth.response(res)) {
        setTemplateList(res.data || []);
        setTemplateTotal(res.total || 0);
      }
    } catch (e) {
      message.error(e.message || '加载失败');
    } finally {
      setTemplateLoading(false);
    }
  };

  // 加载用例列表
  const loadCases = async () => {
    setCaseLoading(true);
    try {
      const params = { page: casePage, size: casePageSize };
      if (searchType) params.case_type = searchType;
      if (searchStatus !== null) params.status = searchStatus;
      const res = await listCase(params);
      if (auth.response(res)) {
        setCaseList(res.data || []);
        setCaseTotal(res.total || 0);
      }
    } catch (e) {
      message.error(e.message || '加载失败');
    } finally {
      setCaseLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'template') {
      loadTemplates();
    } else {
      loadCases();
    }
  }, [activeTab, templatePage, templatePageSize, casePage, casePageSize, searchType, searchStatus]);

  // 删除模板
  const handleDeleteTemplate = async (id) => {
    try {
      const res = await deleteTemplate(id);
      if (auth.response(res)) {
        message.success('删除成功');
        loadTemplates();
      }
    } catch (e) {
      message.error(e.message || '删除失败');
    }
  };

  // 删除用例
  const handleDeleteCase = async (id) => {
    try {
      const res = await deleteCase(id);
      if (auth.response(res)) {
        message.success('删除成功');
        loadCases();
      }
    } catch (e) {
      message.error(e.message || '删除失败');
    }
  };

  // 查看用例详情
  const handleViewCase = async (id) => {
    try {
      const res = await getCase(id);
      if (auth.response(res)) {
        setCaseDetail(res.data);
        setCaseDetailVisible(true);
      }
    } catch (e) {
      message.error(e.message || '加载失败');
    }
  };

  // 模板表格列
  const templateColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true,
    },
    {
      title: '测试类型',
      dataIndex: 'test_type',
      key: 'test_type',
      width: 100,
      render: (type) => {
        const colors = { api: 'blue', functional: 'green', ui: 'purple' };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 80,
      render: (s) => {
        const m = { manual: '手动', ai: 'AI', import: '导入', legacy: '遗留' };
        return m[s] || s;
      },
    },
    {
      title: '字段数',
      dataIndex: 'field_mapping',
      key: 'fields',
      width: 80,
      render: (fm) => fm?.columns?.length || 0,
    },
    {
      title: '默认',
      dataIndex: 'is_default',
      key: 'is_default',
      width: 60,
      render: (v) => (v ? '是' : '否'),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 70,
      render: (v) => (v ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditingTemplate(record);
              setTemplateDrawerVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => handleDeleteTemplate(record.id)}
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

  // 用例表格列
  const caseColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '用例名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true,
    },
    {
      title: '编号',
      dataIndex: 'case_no',
      key: 'case_no',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'case_type',
      key: 'case_type',
      width: 80,
      render: (type) => {
        const colors = { api: 'blue', functional: 'green', ui: 'purple' };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 70,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      render: (s) => {
        const m = { 1: '调试中', 2: '关闭', 3: '正常' };
        return m[s] || s;
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 70,
      render: (s) => {
        const m = { manual: '手动', ai: 'AI', import: '导入' };
        return m[s] || s;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewCase(record.id)}>
            详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditingCase(record);
              setCaseDrawerVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => handleDeleteCase(record.id)}
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

  // 用例详情内容
  const renderCaseDetail = () => {
    if (!caseDetail) return null;
    return (
      <div>
        <Card title="基本信息" size="small">
          <Form layout="vertical">
            <Form.Item label="用例名称">{caseDetail.name}</Form.Item>
            <Form.Item label="用例编号">{caseDetail.case_no}</Form.Item>
            <Form.Item label="优先级">{caseDetail.priority}</Form.Item>
            <Form.Item label="状态">
              {caseDetail.status === 1 ? '调试中' : caseDetail.status === 2 ? '关闭' : '正常'}
            </Form.Item>
            <Form.Item label="前置条件">{caseDetail.preconditions || '-'}</Form.Item>
            <Form.Item label="测试步骤">{caseDetail.test_steps || '-'}</Form.Item>
            <Form.Item label="预期结果">{caseDetail.expected_result || '-'}</Form.Item>
          </Form>
        </Card>
        <Card title="扩展字段" size="small" style={{ marginTop: 16 }}>
          {caseDetail.fields && caseDetail.fields.length > 0 ? (
            caseDetail.fields.map((f, i) => (
              <Form.Item key={i} label={f.field_name}>
                {f.field_value}
              </Form.Item>
            ))
          ) : (
            <Text type="secondary">暂无扩展字段</Text>
          )}
        </Card>
      </div>
    );
  };

  return (
    <PageContainer breadcrumb={null} title={false}>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setSearchType(null);
            setSearchStatus(null);
          }}
          tabBarExtraContent={
            <Button
              type="primary"
              onClick={() => {
                if (activeTab === 'template') {
                  setEditingTemplate(null);
                  setTemplateDrawerVisible(true);
                } else {
                  setEditingCase(null);
                  setCaseDrawerVisible(true);
                }
              }}
            >
              {activeTab === 'template' ? '新建模板' : '新建用例'}
            </Button>
          }
        >
          <Tabs.TabPane key="template" tab="模板管理">
            <Form layout="inline" style={{ marginBottom: 16 }}>
              <Form.Item label="测试类型">
                <Select
                  placeholder="筛选类型"
                  value={searchType}
                  onChange={(val) => {
                    setSearchType(val);
                    setTemplatePage(1);
                  }}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Option value="api">API</Option>
                  <Option value="functional">功能</Option>
                  <Option value="ui">UI</Option>
                </Select>
              </Form.Item>
            </Form>

            <Table
              columns={templateColumns}
              dataSource={templateList}
              rowKey="id"
              loading={templateLoading}
              pagination={{
                current: templatePage,
                pageSize: templatePageSize,
                total: templateTotal,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (p, ps) => {
                  setTemplatePage(p);
                  setTemplatePageSize(ps);
                },
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane key="case" tab="用例管理">
            <Form layout="inline" style={{ marginBottom: 16 }}>
              <Form.Item label="用例类型">
                <Select
                  placeholder="筛选类型"
                  value={searchType}
                  onChange={(val) => {
                    setSearchType(val);
                    setCasePage(1);
                  }}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Option value="api">API</Option>
                  <Option value="functional">功能</Option>
                  <Option value="ui">UI</Option>
                </Select>
              </Form.Item>
              <Form.Item label="状态">
                <Select
                  placeholder="筛选状态"
                  value={searchStatus}
                  onChange={(val) => {
                    setSearchStatus(val);
                    setCasePage(1);
                  }}
                  style={{ width: 100 }}
                  allowClear
                >
                  <Option value={1}>调试中</Option>
                  <Option value={2}>关闭</Option>
                  <Option value={3}>正常</Option>
                </Select>
              </Form.Item>
            </Form>

            <Table
              columns={caseColumns}
              dataSource={caseList}
              rowKey="id"
              loading={caseLoading}
              pagination={{
                current: casePage,
                pageSize: casePageSize,
                total: caseTotal,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (p, ps) => {
                  setCasePage(p);
                  setCasePageSize(ps);
                },
              }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* 模板抽屉 */}
      <CaseTemplateDrawer
        visible={templateDrawerVisible}
        record={editingTemplate}
        mode="template"
        onClose={() => {
          setTemplateDrawerVisible(false);
          setEditingTemplate(null);
        }}
        onSuccess={() => {
          setTemplateDrawerVisible(false);
          setEditingTemplate(null);
          loadTemplates();
        }}
      />

      {/* 用例抽屉 */}
      <CaseTemplateDrawer
        visible={caseDrawerVisible}
        record={editingCase}
        mode="case"
        onClose={() => {
          setCaseDrawerVisible(false);
          setEditingCase(null);
        }}
        onSuccess={() => {
          setCaseDrawerVisible(false);
          setEditingCase(null);
          loadCases();
        }}
      />

      {/* 用例详情抽屉 */}
      <Drawer
        title="用例详情"
        width={600}
        open={caseDetailVisible}
        onClose={() => setCaseDetailVisible(false)}
      >
        {renderCaseDetail()}
      </Drawer>
    </PageContainer>
  );
};

export default CaseV2Page;
