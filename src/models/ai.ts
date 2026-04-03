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

export interface AiState {
  models: AIModelInfo[];
  defaultModel: string;
  currentTaskId: string | null;
  taskStatus: TaskStatus | null;
  taskResult: any | null;
  loading: boolean;
  generateLoading: boolean;
  enhanceLoading: boolean;
  batchLoading: boolean;
}

export default {
  namespace: 'ai',
  state: {
    models: [],
    defaultModel: 'MiniMax-M2.7',
    currentTaskId: null,
    taskStatus: null,
    taskResult: null,
    loading: false,
    generateLoading: false,
    enhanceLoading: false,
    batchLoading: false,
  } as AiState,
  reducers: {
    save(state: AiState, { payload }: any) {
      return { ...state, ...payload };
    },
    setLoading(state: AiState, { payload }: any) {
      return { ...state, ...payload };
    },
    clearTask(state: AiState) {
      return {
        ...state,
        currentTaskId: null,
        taskStatus: null,
        taskResult: null,
      };
    },
  },
  effects: {
    *listModels({}, { call, put }: any) {
      const res = yield call(listAiModels);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            models: res.data?.models || [],
            defaultModel: res.data?.default_model || 'MiniMax-M2.7',
          },
        });
      }
    },

    *generate({ payload }: any, { call, put }: any) {
      yield put({ type: 'setLoading', payload: { generateLoading: true } });
      const res = yield call(generateTestCase, payload);
      yield put({ type: 'setLoading', payload: { generateLoading: false } });
      return res;
    },

    *generateAsync({ payload }: any, { call, put }: any) {
      yield put({ type: 'setLoading', payload: { generateLoading: true } });
      const res = yield call(generateTestCaseAsync, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            currentTaskId: res.data?.task_id,
            taskStatus: res.data?.status,
          },
        });
      }
      yield put({ type: 'setLoading', payload: { generateLoading: false } });
      return res;
    },

    *enhance({ payload }: any, { call, put }: any) {
      yield put({ type: 'setLoading', payload: { enhanceLoading: true } });
      const res = yield call(enhanceAsserts, payload);
      yield put({ type: 'setLoading', payload: { enhanceLoading: false } });
      return res;
    },

    *enhanceAsync({ payload }: any, { call, put }: any) {
      yield put({ type: 'setLoading', payload: { enhanceLoading: true } });
      const res = yield call(enhanceAssertsAsync, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            currentTaskId: res.data?.task_id,
            taskStatus: res.data?.status,
          },
        });
      }
      yield put({ type: 'setLoading', payload: { enhanceLoading: false } });
      return res;
    },

    *batchGen({ payload }: any, { call, put }: any) {
      yield put({ type: 'setLoading', payload: { batchLoading: true } });
      const res = yield call(batchGenerate, payload);
      yield put({ type: 'setLoading', payload: { batchLoading: false } });
      return res;
    },

    *batchGenAsync({ payload }: any, { call, put }: any) {
      yield put({ type: 'setLoading', payload: { batchLoading: true } });
      const res = yield call(batchGenerateAsync, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            currentTaskId: res.data?.task_id,
            taskStatus: res.data?.status,
          },
        });
      }
      yield put({ type: 'setLoading', payload: { batchLoading: false } });
      return res;
    },

    *parseCurl({ payload }: any, { call, put }: any) {
      yield put({ type: 'setLoading', payload: { generateLoading: true } });
      const res = yield call(parseCurl, payload);
      yield put({ type: 'setLoading', payload: { generateLoading: false } });
      return res;
    },

    *pollTask({ payload }: any, { call, put }: any) {
      const { taskId, callback } = payload;
      const res = yield call(getTaskStatus, taskId);
      if (auth.response(res)) {
        const status = res.data?.status || 'PENDING';
        yield put({
          type: 'save',
          payload: { taskStatus: status },
        });
        if (status === 'SUCCESS' || status === 'FAILURE') {
          const resultRes = yield call(getTaskResult, taskId);
          if (auth.response(resultRes)) {
            yield put({
              type: 'save',
              payload: { taskResult: resultRes.data },
            });
          }
        }
        if (callback) {
          callback(status, res.data);
        }
      }
    },
  },
};
