import React, { useState, useEffect } from 'react';
import { Card, Tabs, Input, Select, Switch, Button, Table, message, Space } from 'antd';
import useAi from '@/models/ai';
import TaskStatus from '@/components/Ai/TaskStatus';

const { TextArea } = Input;

export default function GenerateCase() {
  const [inputType, setInputType] = useState('text');
  const [content, setContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [asyncMode, setAsyncMode] = useState(false);
  const [result, setResult] = useState([]);

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
    const res = await parseCurl({ curl: content });
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

        {currentTaskId && (
          <TaskStatus
            taskId={currentTaskId}
            taskStatus={taskStatus}
            taskResult={taskResult}
            onPoll={handlePoll}
            onClear={handleClear}
          />
        )}

        {result.length > 0 && (
          <Table
            dataSource={result}
            columns={columns}
            rowKey={(record, index) => index}
            pagination={false}
          />
        )}
      </Space>
    </Card>
  );
}
