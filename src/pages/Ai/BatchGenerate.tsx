import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Select,
  Switch,
  Button,
  Table,
  InputNumber,
  message,
  Space,
  Progress,
} from 'antd';
import useAi from '@/models/ai';
import TaskStatus from '@/components/Ai/TaskStatus';

const { TextArea } = Input;

export default function BatchGenerate() {
  const [content, setContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [maxCases, setMaxCases] = useState(10);
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
    batchGen,
    batchGenAsync,
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
      message.warning('请输入OpenAPI文档内容');
      return;
    }
    if (!selectedModel) {
      message.warning('请选择模型');
      return;
    }

    const data = {
      content,
      model_name: selectedModel,
      max_cases: maxCases,
      async: asyncMode,
    };

    try {
      let res;
      if (asyncMode) {
        res = await batchGenAsync(data);
        if (res?.code === 0) {
          message.success('任务已提交，请稍后查看结果');
        }
      } else {
        res = await batchGen(data);
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
    <Card title="批量生成测试用例">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
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
          <span>最大用例数：</span>
          <InputNumber min={1} max={100} value={maxCases} onChange={setMaxCases} />
        </Space>

        <Space>
          <Switch checked={asyncMode} onChange={setAsyncMode} />
          <span>异步模式</span>
        </Space>

        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入OpenAPI文档内容（支持YAML或JSON格式）"
          rows={12}
        />

        <Space>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            生成
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
          <>
            <div>
              生成进度：{result.length} / {maxCases} 条
            </div>
            <Progress percent={Math.round((result.length / maxCases) * 100)} />
            <Table
              dataSource={result}
              columns={columns}
              rowKey={(record, index) => index}
              pagination={false}
            />
          </>
        )}
      </Space>
    </Card>
  );
}
