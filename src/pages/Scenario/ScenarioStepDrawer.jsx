import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Table,
  Tag,
  Popconfirm,
  Divider,
  Alert,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import {
  getScenario,
  listScenarioSteps,
  createScenarioStep,
  deleteScenarioStep,
  updateScenarioStep,
} from '@/services/scenario';
import { listCase } from '@/services/case_v2';
import auth from '@/utils/auth';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ScenarioStepDrawer = ({ visible, scenario, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);
  const [cases, setCases] = useState([]);
  const [editingStep, setEditingStep] = useState(null);
  const [caseType, setCaseType] = useState('api');

  useEffect(() => {
    if (visible && scenario) {
      form.setFieldsValue({ scenario_id: scenario.id });
      loadSteps();
      loadCases();
    }
  }, [visible, scenario]);

  const loadSteps = async () => {
    try {
      const res = await listScenarioSteps(scenario.id);
      if (auth.response(res)) {
        setSteps(res.data || []);
      }
    } catch (e) {
      message.error('加载步骤失败');
    }
  };

  const loadCases = async () => {
    try {
      const res = await listCase({ size: 100, case_type: caseType });
      if (auth.response(res)) {
        setCases(res.data || []);
      }
    } catch (e) {
      message.error('加载用例失败');
    }
  };

  useEffect(() => {
    loadCases();
  }, [caseType]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      values.scenario_id = scenario.id;
      const api = editingStep ? updateScenarioStep : createScenarioStep;
      const res = await api(values);
      if (auth.response(res)) {
        message.success(editingStep ? '更新成功' : '创建成功');
        form.resetFields();
        setEditingStep(null);
        loadSteps();
      }
    } catch (e) {
      message.error(e.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteScenarioStep(id);
      if (auth.response(res)) {
        message.success('删除成功');
        loadSteps();
      }
    } catch (e) {
      message.error(e.message || '删除失败');
    }
  };

  const handleEdit = (record) => {
    setEditingStep(record);
    form.setFieldsValue(record);
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingStep(null);
  };

  const columns = [
    {
      title: '顺序',
      dataIndex: 'step_order',
      key: 'step_order',
      width: 60,
    },
    {
      title: '步骤名称',
      dataIndex: 'step_name',
      key: 'step_name',
      width: 120,
    },
    {
      title: '用例ID',
      dataIndex: 'case_id',
      key: 'case_id',
      width: 80,
    },
    {
      title: '输入映射',
      dataIndex: 'input_mapping',
      key: 'input_mapping',
      width: 150,
      render: (val) => {
        if (!val || val.length === 0) return <Text type="secondary">无</Text>;
        return <Tag>{val.length} 个映射</Tag>;
      },
    },
    {
      title: '输出映射',
      dataIndex: 'output_mapping',
      key: 'output_mapping',
      width: 150,
      render: (val) => {
        if (!val || val.length === 0) return <Text type="secondary">无</Text>;
        return <Tag>{val.length} 个映射</Tag>;
      },
    },
    {
      title: '条件',
      dataIndex: 'condition',
      key: 'condition',
      width: 100,
      render: (val) => val || '-',
    },
    {
      title: '超时(ms)',
      dataIndex: 'timeout_ms',
      key: 'timeout_ms',
      width: 90,
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
    <Drawer title={`步骤管理 - ${scenario?.name}`} width={700} open={visible} onClose={onClose}>
      <Divider>添加/编辑步骤</Divider>

      <Form form={form} layout="vertical" style={{ marginBottom: 24 }}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="scenario_id" hidden>
          <Input />
        </Form.Item>

        <Space style={{ marginBottom: 16 }}>
          <Form.Item
            name="case_id"
            label="用例"
            rules={[{ required: true, message: '请选择用例' }]}
            style={{ width: 200 }}
          >
            <Select placeholder="选择用例" showSearch optionFilterProp="children">
              {cases.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="step_order"
            label="顺序"
            rules={[{ required: true, message: '请输入顺序' }]}
            style={{ width: 80 }}
          >
            <Input type="number" placeholder="1" />
          </Form.Item>

          <Form.Item name="step_name" label="步骤名称" style={{ width: 150 }}>
            <Input placeholder="如：登录" />
          </Form.Item>
        </Space>

        <Space style={{ marginBottom: 16 }}>
          <Form.Item name="timeout_ms" label="超时(ms)" style={{ width: 120 }}>
            <Input type="number" placeholder="30000" />
          </Form.Item>

          <Form.Item name="retry_count" label="重试次数" style={{ width: 100 }}>
            <Input type="number" placeholder="0" />
          </Form.Item>

          <Form.Item name="condition" label="执行条件" style={{ width: 150 }}>
            <Input placeholder="如: status == 200" />
          </Form.Item>
        </Space>

        <Form.Item name="input_mapping" label="输入映射（JSON）">
          <TextArea
            rows={2}
            placeholder='[{"from_step": 1, "from_var": "token", "to_field": "headers.authorization"}]'
          />
        </Form.Item>

        <Form.Item name="output_mapping" label="输出映射（JSON）">
          <TextArea
            rows={2}
            placeholder='[{"var_name": "token", "extract_path": "$.data.token"}]'
          />
        </Form.Item>

        <Alert
          message="参数映射说明"
          description={
            <div>
              <p>
                <b>输入映射：</b>将上一步的输出注入到当前步骤。如 from_step: 1, from_var: token
                表示引用步骤1的token变量
              </p>
              <p>
                <b>输出映射：</b>将当前步骤的输出提取为变量，供后续步骤使用。如 var_name: token,
                extract_path: $.data.token
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Space>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {editingStep ? '更新步骤' : '添加步骤'}
          </Button>
          {editingStep && <Button onClick={handleCancel}>取消编辑</Button>}
        </Space>
      </Form>

      <Divider>步骤列表</Divider>

      <Table columns={columns} dataSource={steps} rowKey="id" size="small" pagination={false} />
    </Drawer>
  );
};

export default ScenarioStepDrawer;
