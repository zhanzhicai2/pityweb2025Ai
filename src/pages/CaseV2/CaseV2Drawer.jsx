import { Drawer, Form, Input, Select, Switch, Button, Space, message, Divider } from 'antd';
import { useEffect, useState } from 'react';
import {
  createTemplate,
  updateTemplate,
  createCase,
  updateCase,
  listTemplate,
  getTemplate,
} from '@/services/case_v2';
import auth from '@/utils/auth';

const { Option } = Select;
const { TextArea } = Input;

const CaseV2Drawer = ({ visible, record, onClose, onSuccess, mode = 'template' }) => {
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);

  const isTemplate = mode === 'template';
  const isEdit = !!record?.id;

  // 加载模板列表（用例模式用）
  const loadTemplates = async () => {
    try {
      const res = await listTemplate({ page: 1, size: 100, is_active: true });
      if (auth.response(res)) {
        setTemplates(res.data || []);
      }
    } catch (e) {
      message.error('加载模板失败');
    }
  };

  // 加载用例详情（含扩展字段）
  const loadCaseDetail = async (id) => {
    try {
      const res = await getCase(id);
      if (auth.response(res)) {
        const data = res.data;
        form.setFieldsValue({
          id: data.id,
          name: data.name,
          case_no: data.case_no,
          priority: data.priority,
          status: data.status,
          template_id: data.template_id,
          case_type: data.case_type,
          source: data.source,
          preconditions: data.preconditions,
          test_steps: data.test_steps,
          expected_result: data.expected_result,
        });
        // 加载关联的模板
        if (data.template_id) {
          const tpl = templates.find((t) => t.id === data.template_id) || { id: data.template_id };
          if (!tpl.field_mapping) {
            const tplRes = await getTemplate(data.template_id);
            if (auth.response(tplRes)) {
              setSelectedTemplate(tplRes.data);
            }
          } else {
            setSelectedTemplate(tpl);
          }
        }
        // 加载扩展字段值
        if (data.fields && data.fields.length > 0) {
          const fieldValues = {};
          data.fields.forEach((f) => {
            fieldValues[`field_${f.field_name}`] = f.field_value;
          });
          form.setFieldsValue(fieldValues);
        }
      }
    } catch (e) {
      message.error('加载用例详情失败');
    }
  };

  useEffect(() => {
    if (visible) {
      if (isTemplate) {
        // 模板模式
        if (record) {
          form.setFieldsValue(record);
        } else {
          form.resetFields();
          form.setFieldsValue({
            test_type: 'api',
            source: 'manual',
            is_default: false,
            is_active: true,
            field_mapping: { columns: [] },
          });
        }
      } else {
        // 用例模式 - 先加载模板列表
        loadTemplates();
        if (record) {
          // 编辑模式
          loadCaseDetail(record.id);
        } else {
          form.resetFields();
          form.setFieldsValue({
            priority: 'P2',
            status: 1,
            source: 'manual',
          });
        }
      }
    }
  }, [visible, record, isTemplate]);

  // 模板选中变化
  const handleTemplateChange = async (templateId) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setSelectedTemplate(tpl);
    } else {
      // 异步加载
      try {
        const res = await getTemplate(templateId);
        if (auth.response(res)) {
          setSelectedTemplate(res.data);
        }
      } catch (e) {
        message.error('加载模板失败');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!isTemplate && selectedTemplate) {
        // 用例模式 - 提取扩展字段
        const fields = [];
        const columns = selectedTemplate.field_mapping?.columns || [];
        columns.forEach((col) => {
          const key = `field_${col.name}`;
          if (values[key] !== undefined) {
            fields.push({
              field_name: col.name,
              field_value: String(values[key]),
            });
          }
        });
        values.fields = fields;
        // 删除临时字段
        columns.forEach((col) => {
          delete values[`field_${col.name}`];
        });
      }

      let api;
      if (isTemplate) {
        api = isEdit ? updateTemplate : createTemplate;
      } else {
        api = isEdit ? updateCase : createCase;
      }

      const res = await api(values);
      if (auth.response(res)) {
        message.success(isEdit ? '更新成功' : '创建成功');
        onSuccess?.();
      }
    } catch (e) {
      message.error(e.message || '操作失败');
    }
  };

  // 字段映射编辑
  const handleFieldMappingChange = (index, field, value) => {
    const columns = form.getFieldValue('field_mapping')?.columns || [];
    columns[index] = { ...columns[index], [field]: value };
    form.setFieldValue('field_mapping', { columns });
  };

  const addColumn = () => {
    const columns = form.getFieldValue('field_mapping')?.columns || [];
    columns.push({ name: '', label: '', type: 'string', required: false, options: [] });
    form.setFieldValue('field_mapping', { columns });
  };

  const removeColumn = (index) => {
    const columns = form.getFieldValue('field_mapping')?.columns || [];
    columns.splice(index, 1);
    form.setFieldValue('field_mapping', { columns });
  };

  // 根据字段类型渲染表单组件
  const renderDynamicField = (col) => {
    const key = `field_${col.name}`;
    const rules = col.required ? [{ required: true, message: `请输入${col.label}` }] : [];

    switch (col.type) {
      case 'string':
        return <Input placeholder={`请输入${col.label}`} />;
      case 'number':
        return <Input type="number" placeholder={`请输入${col.label}`} />;
      case 'boolean':
        return <Switch checkedChildren="是" unCheckedChildren="否" />;
      case 'select':
        return (
          <Select placeholder={`请选择${col.label}`}>
            {(col.options || []).map((opt) => (
              <Option key={opt} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        );
      case 'json':
        return <TextArea rows={3} placeholder="JSON格式" />;
      case 'text':
        return <TextArea rows={3} placeholder={`请输入${col.label}`} />;
      default:
        return <Input placeholder={`请输入${col.label}`} />;
    }
  };

  return (
    <Drawer
      title={isTemplate ? (isEdit ? '编辑模板' : '新建模板') : isEdit ? '编辑用例' : '新建用例'}
      width={600}
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

        {isTemplate ? (
          <>
            <Form.Item
              name="name"
              label="模板名称"
              rules={[{ required: true, message: '请输入模板名称' }]}
            >
              <Input placeholder="如：API测试模板" />
            </Form.Item>

            <Form.Item name="description" label="描述">
              <TextArea rows={2} placeholder="模板描述" />
            </Form.Item>

            <Form.Item
              name="test_type"
              label="测试类型"
              rules={[{ required: true, message: '请选择测试类型' }]}
            >
              <Select>
                <Option value="api">API 测试</Option>
                <Option value="functional">功能测试</Option>
                <Option value="ui">UI 测试</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="source"
              label="来源"
              rules={[{ required: true, message: '请选择来源' }]}
            >
              <Select>
                <Option value="manual">手动创建</Option>
                <Option value="ai">AI 生成</Option>
                <Option value="import">导入</Option>
                <Option value="legacy">遗留</Option>
              </Select>
            </Form.Item>

            <Divider>字段映射配置</Divider>

            <Form.Item label="字段列表">
              {form.getFieldValue('field_mapping')?.columns?.map((col, index) => (
                <div
                  key={index}
                  style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}
                >
                  <Input
                    placeholder="字段名"
                    value={col.name}
                    onChange={(e) => handleFieldMappingChange(index, 'name', e.target.value)}
                    style={{ width: 90 }}
                  />
                  <Input
                    placeholder="显示标签"
                    value={col.label}
                    onChange={(e) => handleFieldMappingChange(index, 'label', e.target.value)}
                    style={{ width: 90 }}
                  />
                  <Select
                    placeholder="类型"
                    value={col.type || 'string'}
                    onChange={(value) => handleFieldMappingChange(index, 'type', value)}
                    style={{ width: 80 }}
                  >
                    <Option value="string">字符串</Option>
                    <Option value="number">数字</Option>
                    <Option value="boolean">布尔</Option>
                    <Option value="select">选择</Option>
                    <Option value="json">JSON</Option>
                    <Option value="text">多行文本</Option>
                  </Select>
                  <Input
                    placeholder="选项(逗号)"
                    value={col.options?.join(',')}
                    onChange={(e) =>
                      handleFieldMappingChange(
                        index,
                        'options',
                        e.target.value.split(',').filter(Boolean),
                      )
                    }
                    disabled={col.type !== 'select'}
                    style={{ width: 100 }}
                  />
                  <Switch
                    size="small"
                    checkedChildren="必"
                    unCheckedChildren="可"
                    checked={col.required}
                    onChange={(checked) => handleFieldMappingChange(index, 'required', checked)}
                  />
                  <Button size="small" danger onClick={() => removeColumn(index)}>
                    删
                  </Button>
                </div>
              ))}
              <Button type="dashed" onClick={addColumn} block>
                + 添加字段
              </Button>
            </Form.Item>

            <Form.Item name="is_default" label="设为默认模板" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="is_active" label="启用状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              name="name"
              label="用例名称"
              rules={[{ required: true, message: '请输入用例名称' }]}
            >
              <Input placeholder="如：登录接口测试" />
            </Form.Item>

            <Form.Item name="case_no" label="用例编号">
              <Input placeholder="如：API_001" />
            </Form.Item>

            <Form.Item
              name="template_id"
              label="关联模板"
              rules={[{ required: true, message: '请选择模板' }]}
            >
              <Select
                placeholder="请选择模板"
                onChange={handleTemplateChange}
                showSearch
                optionFilterProp="children"
              >
                {templates.map((t) => (
                  <Option key={t.id} value={t.id}>
                    {t.name} ({t.test_type})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="case_type"
              label="用例类型"
              rules={[{ required: true, message: '请选择用例类型' }]}
            >
              <Select>
                <Option value="api">API 测试</Option>
                <Option value="functional">功能测试</Option>
                <Option value="ui">UI 测试</Option>
              </Select>
            </Form.Item>

            <Form.Item name="priority" label="优先级">
              <Select>
                <Option value="P0">P0 - 核心功能</Option>
                <Option value="P1">P1 - 重要功能</Option>
                <Option value="P2">P2 - 一般功能</Option>
                <Option value="P3">P3 - 低优先级</Option>
              </Select>
            </Form.Item>

            <Form.Item name="status" label="状态">
              <Select>
                <Option value={1}>调试中</Option>
                <Option value={2}>暂时关闭</Option>
                <Option value={3}>正常</Option>
              </Select>
            </Form.Item>

            <Form.Item name="source" label="来源">
              <Select>
                <Option value="manual">手动创建</Option>
                <Option value="ai">AI 生成</Option>
                <Option value="import">导入</Option>
              </Select>
            </Form.Item>

            <Divider>测试内容</Divider>

            <Form.Item name="preconditions" label="前置条件">
              <TextArea rows={2} placeholder="执行用例的前置条件" />
            </Form.Item>

            <Form.Item name="test_steps" label="测试步骤">
              <TextArea rows={3} placeholder="详细的测试步骤" />
            </Form.Item>

            <Form.Item name="expected_result" label="预期结果">
              <TextArea rows={2} placeholder="期望的测试结果" />
            </Form.Item>

            {/* 动态扩展字段 */}
            {selectedTemplate?.field_mapping?.columns?.length > 0 && (
              <>
                <Divider>扩展字段（按模板动态渲染）</Divider>
                {selectedTemplate.field_mapping.columns.map((col, index) => {
                  const key = `field_${col.name}`;
                  const rules = col.required
                    ? [{ required: true, message: `请输入${col.label}` }]
                    : [];

                  return (
                    <Form.Item key={key} name={key} label={col.label} rules={rules}>
                      {renderDynamicField(col)}
                    </Form.Item>
                  );
                })}
              </>
            )}
          </>
        )}
      </Form>
    </Drawer>
  );
};

export default CaseV2Drawer;
