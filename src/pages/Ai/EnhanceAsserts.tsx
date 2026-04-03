import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Switch, Button, message, Space, Alert } from 'antd';
import { useModel } from 'umi';
import TaskStatus from '@/components/Ai/TaskStatus';

const { TextArea } = Input;

export default function EnhanceAsserts() {
  const [caseId] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [model, setModel] = useState('');
  const [asyncMode, setAsyncMode] = useState(false);
  const [result, setResult] = useState(null);

  const { state, listModels, enhance, enhanceAsync, pollTask, clearTask } = useModel('ai');

  useEffect(() => {
    if (!state.models.length) {
      listModels();
    }
  }, []);

  useEffect(() => {
    if (state.models.length && !model) {
      setModel(state.defaultModel || state.models[0]?.name);
    }
  }, [state.models, model]);

  const handleSubmit = async () => {
    if (!caseId) {
      message.warning('请选择用例');
      return;
    }
    if (!response.trim()) {
      message.warning('请输入响应示例');
      return;
    }
    if (!model) {
      message.warning('请选择模型');
      return;
    }

    const data = {
      case_id: caseId,
      response,
      model_name: model,
      async: asyncMode,
    };

    try {
      let res;
      if (asyncMode) {
        res = await enhanceAsync(data);
        if (res?.code === 0) {
          message.success('任务已提交，请稍后查看结果');
        }
      } else {
        res = await enhance(data);
        if (res?.code === 0) {
          setResult(res.data);
          message.success('增强成功');
        }
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handlePoll = (taskId) => {
    pollTask({
      taskId,
      callback: (status, data) => {
        if (status === 'SUCCESS') {
          setResult(data);
        }
      },
    });
  };

  const handleClear = () => {
    clearTask();
    setResult(null);
  };

  return (
    <Card title="AI 增强断言">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space>
          <span>模型：</span>
          <Select value={model} onChange={setModel} style={{ width: 200 }} placeholder="选择模型">
            {state.models.map((m) => (
              <Select.Option key={m.name} value={m.name}>
                {m.display_name}
              </Select.Option>
            ))}
          </Select>
        </Space>

        <Space>
          <Switch checked={asyncMode} onChange={setAsyncMode} />
          <span>异步模式</span>
        </Space>

        <div>
          <div style={{ marginBottom: 8 }}>响应示例：</div>
          <TextArea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="请输入接口响应示例（JSON格式）"
            rows={8}
          />
        </div>

        <Space>
          <Button type="primary" onClick={handleSubmit} loading={state.loading}>
            增强断言
          </Button>
          <Button onClick={handleClear}>清除</Button>
        </Space>

        {state.currentTaskId && (
          <TaskStatus
            taskId={state.currentTaskId}
            taskStatus={state.taskStatus}
            taskResult={state.taskResult}
            onPoll={handlePoll}
            onClear={handleClear}
          />
        )}

        {result && !state.currentTaskId && (
          <>
            <Alert type="success" message="断言增强成功" />
            <pre
              style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 300,
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </>
        )}
      </Space>
    </Card>
  );
}
