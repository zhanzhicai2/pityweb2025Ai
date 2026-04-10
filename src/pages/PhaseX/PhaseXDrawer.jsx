import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Divider,
  Alert,
  InputNumber,
  Switch,
} from 'antd';
import { useEffect, useState } from 'react';
import { createPhaseXPlan, updatePhaseXPlan } from '@/services/phasex';
import { listScenario } from '@/services/scenario';
import { listCase } from '@/services/case_v2';
import auth from '@/utils/auth';

const { Option } = Select;
const { TextArea } = Input;

const PhaseXDrawer = ({ visible, record, projects, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [planType, setPlanType] = useState('single');
  const [scenarios, setScenarios] = useState([]);
  const [cases, setCases] = useState([]);
  const [environments, setEnvironments] = useState([]);

  useEffect(() => {
    if (visible) {
      if (record?.id) {
        setIsEdit(true);
        form.setFieldsValue(record);
        setPlanType(record.plan_type || 'single');
      } else {
        setIsEdit(false);
        form.resetFields();
        form.setFieldsValue({
          is_periodic: 0,
          is_active: 1,
          plan_type: 'single',
          config: {},
        });
      }
    }
  }, [visible, record]);

  // 加载场景列表
  useEffect(() => {
    if (visible) {
      loadScenarios();
      loadCases();
      loadEnvironments();
    }
  }, [visible]);

  const loadScenarios = async () => {
    try {
      const res = await listScenario({ size: 100 });
      if (auth.response(res)) {
        setScenarios(res.data || []);
      }
    } catch (e) {
      console.error('加载场景失败', e);
    }
  };

  const loadCases = async () => {
    try {
      const res = await listCase({ size: 100 });
      if (auth.response(res)) {
        setCases(res.data || []);
      }
    } catch (e) {
      console.error('加载用例失败', e);
    }
  };

  const loadEnvironments = async () => {
    // TODO: 调用环境列表 API
    setEnvironments([]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const api = isEdit ? updatePhaseXPlan : createPhaseXPlan;
      const res = await api(values);
      if (auth.response(res)) {
        message.success(isEdit ? '更新成功' : '创建成功');
        onSuccess?.();
      }
    } catch (e) {
      message.error(e.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanTypeChange = (val) => {
    setPlanType(val);
    form.setFieldsValue({ target_id: undefined, target_name: undefined });
  };

  return (
    <Drawer
      title={isEdit ? '编辑测试计划' : '新建测试计划'}
      width={550}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {isEdit ? '更新' : '创建'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="计划名称"
          rules={[{ required: true, message: '请输入计划名称' }]}
        >
          <Input placeholder="如：每日回归测试" />
        </Form.Item>

        <Form.Item
          name="project_id"
          label="所属项目"
          rules={[{ required: true, message: '请选择项目' }]}
        >
          <Select placeholder="请选择项目">
            {projects?.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="plan_type"
          label="执行类型"
          rules={[{ required: true, message: '请选择执行类型' }]}
        >
          <Select onChange={handlePlanTypeChange}>
            <Option value="single">单个用例</Option>
            <Option value="scenario">场景流程</Option>
            <Option value="suite">测试套件</Option>
          </Select>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.plan_type !== curr.plan_type}>
          {({ getFieldValue }) => {
            const type = getFieldValue('plan_type');
            if (type === 'scenario') {
              return (
                <Form.Item
                  name="target_id"
                  label="选择场景"
                  rules={[{ required: true, message: '请选择场景' }]}
                >
                  <Select placeholder="请选择场景" showSearch optionFilterProp="children">
                    {scenarios.map((s) => (
                      <Option key={s.id} value={s.id}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            }
            if (type === 'single') {
              return (
                <Form.Item
                  name="target_id"
                  label="选择用例"
                  rules={[{ required: true, message: '请选择用例' }]}
                >
                  <Select placeholder="请选择用例" showSearch optionFilterProp="children">
                    {cases.map((c) => (
                      <Option key={c.id} value={c.id}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>

        <Form.Item name="environment_id" label="执行环境">
          <Select placeholder="请选择环境" allowClear>
            {environments.map((e) => (
              <Option key={e.id} value={e.id}>
                {e.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Divider>调度配置</Divider>

        <Form.Item name="is_periodic" label="是否周期执行">
          <Switch
            checked={form.getFieldValue('is_periodic') === 1}
            onChange={(checked) => {
              form.setFieldsValue({ is_periodic: checked ? 1 : 0 });
            }}
          />
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.is_periodic !== curr.is_periodic}>
          {({ getFieldValue }) => {
            if (getFieldValue('is_periodic') === 1) {
              return (
                <Form.Item
                  name="cron_expression"
                  label="Cron 表达式"
                  rules={[{ required: true, message: '请输入Cron表达式' }]}
                >
                  <Input placeholder="如: 0 0 * * * (每天凌晨)" />
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>

        <Divider>执行配置</Divider>

        <Form.Item name="description" label="计划描述">
          <TextArea rows={2} placeholder="描述这个测试计划..." />
        </Form.Item>

        <Form.Item name="tags" label="标签">
          <Input placeholder="多个标签用逗号分隔" />
        </Form.Item>

        {isEdit && (
          <Form.Item name="is_active" label="状态">
            <Select>
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        )}

        <Alert
          message="执行类型说明"
          description={
            <div>
              <p>
                <b>单个用例：</b>执行一个指定的测试用例
              </p>
              <p>
                <b>场景流程：</b>执行一个完整的场景流程（多个用例串联）
              </p>
              <p>
                <b>测试套件：</b>执行一个测试套件（多个用例并列）
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Form>
    </Drawer>
  );
};

export default PhaseXDrawer;
