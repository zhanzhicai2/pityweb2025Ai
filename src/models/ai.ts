import { useState, useCallback } from 'react';
import {
  generateTestCase,
  generateTestCaseAsync,
  enhanceAsserts,
  enhanceAssertsAsync,
  batchGenerate,
  batchGenerateAsync,
  parseCurl,
  listAiModels,
} from '@/services/ai';
import { getTaskStatus, getTaskResult } from '@/services/task';
import auth from '@/utils/auth';

export interface AIModelInfo {
  name: string;
  display_name: string;
  description: string;
  is_default: boolean;
}

export type TaskStatus = 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY' | 'REVOKED';

export default function useAi() {
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [defaultModel, setDefaultModel] = useState('MiniMax-M2.7');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [taskResult, setTaskResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  const listModels = useCallback(async () => {
    setLoading(true);
    const res = await listAiModels();
    setLoading(false);
    if (auth.response(res)) {
      setModels(res.data?.models || []);
      setDefaultModel(res.data?.default_model || 'MiniMax-M2.7');
    }
  }, []);

  const generate = useCallback(async (data: any) => {
    setGenerateLoading(true);
    const res = await generateTestCase(data);
    setGenerateLoading(false);
    return res;
  }, []);

  const generateAsync = useCallback(async (data: any) => {
    setGenerateLoading(true);
    const res = await generateTestCaseAsync(data);
    setGenerateLoading(false);
    if (auth.response(res)) {
      setCurrentTaskId(res.data?.task_id);
      setTaskStatus(res.data?.status);
    }
    return res;
  }, []);

  const enhance = useCallback(async (data: any) => {
    setEnhanceLoading(true);
    const res = await enhanceAsserts(data);
    setEnhanceLoading(false);
    return res;
  }, []);

  const enhanceAsync = useCallback(async (data: any) => {
    setEnhanceLoading(true);
    const res = await enhanceAssertsAsync(data);
    setEnhanceLoading(false);
    if (auth.response(res)) {
      setCurrentTaskId(res.data?.task_id);
      setTaskStatus(res.data?.status);
    }
    return res;
  }, []);

  const batchGen = useCallback(async (data: any) => {
    setBatchLoading(true);
    const res = await batchGenerate(data);
    setBatchLoading(false);
    return res;
  }, []);

  const batchGenAsync = useCallback(async (data: any) => {
    setBatchLoading(true);
    const res = await batchGenerateAsync(data);
    setBatchLoading(false);
    if (auth.response(res)) {
      setCurrentTaskId(res.data?.task_id);
      setTaskStatus(res.data?.status);
    }
    return res;
  }, []);

  const parseCurlFn = useCallback(async (data: any) => {
    setGenerateLoading(true);
    const res = await parseCurl(data);
    setGenerateLoading(false);
    return res;
  }, []);

  const pollTask = useCallback(
    async ({
      taskId,
      callback,
    }: {
      taskId: string;
      callback?: (status: string, data: any) => void;
    }) => {
      const res = await getTaskStatus(taskId);
      if (auth.response(res)) {
        const status = res.data?.status || 'PENDING';
        setTaskStatus(status);
        if (status === 'SUCCESS' || status === 'FAILURE') {
          const resultRes = await getTaskResult(taskId);
          if (auth.response(resultRes)) {
            setTaskResult(resultRes.data);
          }
        }
        if (callback) {
          callback(status, res.data);
        }
      }
    },
    [],
  );

  const clearTask = useCallback(() => {
    setCurrentTaskId(null);
    setTaskStatus(null);
    setTaskResult(null);
  }, []);

  return {
    models,
    defaultModel,
    currentTaskId,
    taskStatus,
    taskResult,
    loading,
    generateLoading,
    enhanceLoading,
    batchLoading,
    listModels,
    generate,
    generateAsync,
    enhance,
    enhanceAsync,
    batchGen,
    batchGenAsync,
    parseCurl: parseCurlFn,
    pollTask,
    clearTask,
  };
}
