import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Input, Select, Switch, Spin, message } from 'antd';
import useAi from '@/models/ai';
import TaskStatus from './TaskStatus';

const { TextArea } = Input;

export default function GenerateModal({ visible, onClose, onSuccess }) {
  const [inputType, setInputType] = useState('text');
  const [content, setContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [asyncMode, setAsyncMode] = useState(false);
  const [result, setResult] = useState(null);

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
    if (visible && !models.length) {
      listModels();
    }
  }, [visible]);

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
          setResult(res.data);
          message.success('生成成功');
          onSuccess?.(res.data);
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
      setResult(res.data);
      message.success('解析成功');
      onSuccess?.(res.data);
    }
  };

  const handlePoll = (taskId) => {
    pollTask({
      taskId,
      callback: (status, data) => {
        if (status === 'SUCCESS') {
          setResult(data);
          onSuccess?.(data);
        }
      },
    });
  };

  const handleClear = () => {
    clearTask();
    setResult(null);
  };

  return (
    <Modal
      title="AI 生成测试用例"
      open={visible}
      onCancel={onClose}
      onOk={inputType === 'curl' ? handleCurlParse : handleSubmit}
      width={720}
      maskClosable={false}
    >
      <div style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={inputType}
          onChange={setInputType}
          items={[
            { key: 'text', label: '文本描述' },
            { key: 'curl', label: 'cURL' },
            { key: 'openapi', label: 'OpenAPI' },
          ]}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>模型：</span>
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
      </div>

      {inputType !== 'curl' && (
        <div style={{ marginBottom: 16 }}>
          <Switch checked={asyncMode} onChange={setAsyncMode} />
          <span style={{ marginLeft: 8 }}>异步模式</span>
        </div>
      )}

      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          inputType === 'text'
            ? '请输入接口描述，如：用户登录接口，请求方式POST，URL /api/login...'
            : inputType === 'curl'
            ? '请输入cURL命令，如：curl -X POST https://api.example.com/login...'
            : '请输入OpenAPI JSON格式的接口定义'
        }
        rows={6}
        style={{ marginBottom: 16 }}
      />

      {loading && <Spin tip="处理中..." />}

      {currentTaskId && (
        <TaskStatus
          taskId={currentTaskId}
          taskStatus={taskStatus}
          taskResult={taskResult}
          onPoll={handlePoll}
          onClear={handleClear}
        />
      )}

      {result && !currentTaskId && (
        <div style={{ marginTop: 16 }}>
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
        </div>
      )}
    </Modal>
  );
}
