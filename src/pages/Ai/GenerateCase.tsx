// @ts-nocheck
import TaskStatus from '@/components/Ai/TaskStatus';
import useAi from '@/models/ai';
import { listProject } from '@/services/project';
import { Button, Card, Input, message, Select, Space, Switch, Table, Tabs } from 'antd';
import { useEffect, useState } from 'react';

const { TextArea } = Input;

export default function GenerateCase() {
  const [inputType, setInputType] = useState('text');
  const [content, setContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [asyncMode, setAsyncMode] = useState(false);
  const [result, setResult] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | undefined>(undefined);

  const {
    models,
    defaultModel,
    currentTaskId,
    taskStatus,
    taskResult,
    loading,
    listModels,
    generate,
    generateAsync,
    parseCurl,
    pollTask,
    clearTask,
  } = useAi();

  useEffect(() => {
    if (!models.length) {
      listModels();
    }
  }, []);

  useEffect(() => {
    if (models.length && !selectedModel) {
      setSelectedModel(defaultModel || models[0]?.name);
    }
  }, [models, defaultModel, selectedModel]);

  // 获取项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await listProject({});
        if (res?.code === 0) {
          setProjects(res.data || []);
        }
      } catch (e) {
        console.error('获取项目列表失败', e);
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning('请输入内容');
      return;
    }
    if (!selectedModel) {
      message.warning('请选择模型');
      return;
    }

    const data = {
      content,
      input_type: inputType,
      model_name: selectedModel,
      async: asyncMode,
      project_id: selectedProject,
    };

    try {
      let res;
      if (asyncMode) {
        res = await generateAsync(data);
        if (res?.code === 0) {
          message.success('任务已提交，请稍后查看结果');
        }
      } else {
        res = await generate(data);
        if (res?.code === 0) {
          const cases = Array.isArray(res.data) ? res.data : [res.data];
          setResult(cases);
          message.success(`生成成功，共 ${cases.length} 条用例`);
        }
      }
    } catch {
      message.error('操作失败');
    }
  };

  const handleCurlParse = async () => {
    if (!content.trim()) {
      message.warning('请输入cURL内容');
      return;
    }
    const res = await parseCurl({ curl: content, project_id: selectedProject });
    if (res?.code === 0) {
      const cases = Array.isArray(res.data) ? res.data : [res.data];
      setResult(cases);
      message.success('解析成功');
    }
  };

  const handlePoll = (taskId: string) => {
    pollTask({
      taskId,
      callback: (status, data) => {
        if (status === 'SUCCESS') {
          const cases = Array.isArray(data) ? data : [data];
          setResult(cases);
        }
      },
    });
  };

  const handleClear = () => {
    clearTask();
    setResult([]);
  };

  const columns = [
    { title: '用例名称', dataIndex: 'name', key: 'name' },
    { title: '请求方式', dataIndex: 'method', key: 'method' },
    { title: '请求路径', dataIndex: 'path', key: 'path' },
    { title: '描述', dataIndex: 'description', key: 'description' },
  ];

  return (
    <Card title="AI 生成测试用例">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Tabs
          activeKey={inputType}
          onChange={setInputType}
          items={[
            { key: 'text', label: '文本描述' },
            { key: 'curl', label: 'cURL' },
            { key: 'openapi', label: 'OpenAPI' },
          ]}
        />

        <Space>
          <span>模型：</span>
          <Select
            value={selectedModel}
            onChange={setSelectedModel}
            style={{ width: 200 }}
            placeholder="选择模型"
          >
            {models.map((m) => (
              <Select.Option key={m.name} value={m.name}>
                {m.display_name}
              </Select.Option>
            ))}
          </Select>
        </Space>

        <Space>
          <span>项目：</span>
          <Select
            value={selectedProject}
            onChange={(value) => setSelectedProject(value)}
            placeholder="选择项目（可选）"
            allowClear
            style={{ width: 200 }}
          >
            {projects.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Space>

        {inputType !== 'curl' && (
          <Space>
            <Switch checked={asyncMode} onChange={setAsyncMode} />
            <span>异步模式</span>
          </Space>
        )}

        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            inputType === 'text'
              ? '请输入接口描述，如：用户登录接口，请求方式POST，URL /api/login...'
              : inputType === 'curl'
              ? '请输入cURL命令'
              : '请输入OpenAPI JSON格式'
          }
          rows={6}
        />

        <Space>
          <Button
            type="primary"
            onClick={inputType === 'curl' ? handleCurlParse : handleSubmit}
            loading={loading}
          >
            {inputType === 'curl' ? '解析' : '生成'}
          </Button>
          <Button onClick={handleClear}>清除</Button>
        </Space>

        {currentTaskId ? (
          <TaskStatus
            taskId={/** @type {string} */ currentTaskId}
            taskStatus={taskStatus}
            taskResult={taskResult}
            onPoll={handlePoll}
            onClear={handleClear}
          />
        ) : null}

        {result.length > 0 && (
          <Table
            dataSource={result}
            columns={columns}
            rowKey={(record: any, index?: number) => index ?? 0}
            pagination={false}
          />
        )}
      </Space>
    </Card>
  );
}
