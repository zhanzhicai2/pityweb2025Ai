// @ts-nocheck
import { executeCase, executeSelectedCase } from '@/services/request';
import {
  createTestCase,
  createTestCaseV2,
  deleteTestcase,
  deleteTestCaseAsserts,
  deleteTestcaseData,
  deleteTestcaseDirectory,
  insertTestCaseAsserts,
  insertTestcaseData,
  insertTestcaseDirectory,
  listTestcase,
  listTestcaseTree,
  moveTestCase,
  onlinePyScript,
  queryTestCase,
  queryTestcaseDirectory,
  retryCase,
  updateTestCase,
  updateTestCaseAsserts,
  updateTestcaseData,
  updateTestcaseDirectory,
} from '@/services/testcase';
import auth from '@/utils/auth';

interface Payload {
  payload?: any;
}

interface State {
  directory: any[];
  currentDirectory: any[];
  selectedRowKeys: any[];
  directoryName: string;
  casePermission: boolean;
  testcases: any[];
  testResult: any;
  editing: boolean;
  caseInfo: any;
  constructRecord: any;
  asserts: any[];
  postConstructor: any[];
  preConstructor: any[];
  testData: any;
  retryResult: any;
  envActiveKey: string;
  constructors_case: any;
  constructorModal: boolean;
  activeKey: string;
  pagination: {
    current: number;
    total: number;
    showTotal: (total: number) => string;
    pageSize: number;
  };
  outParameters: any[];
}

export default {
  namespace: 'testcase',
  state: {
    directory: [],
    currentDirectory: [],
    selectedRowKeys: [],
    directoryName: '加载中...',
    casePermission: false,
    testcases: [],
    testResult: {},
    editing: false,
    caseInfo: {},
    constructRecord: {},
    asserts: [],
    postConstructor: [],
    preConstructor: [],
    testData: {},
    retryResult: {},
    envActiveKey: '',
    constructors_case: {},
    constructorModal: false,
    activeKey: '3',

    pagination: {
      current: 1,
      total: 0,
      showTotal: (total: number) => `共${total}条用例`,
      pageSize: 8,
    },
    outParameters: [],
  } as State,
  reducers: {
    save(state: State, { payload }: Payload) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  effects: {
    *listTestcaseDirectory({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(listTestcaseTree, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            directory: res.data,
            currentDirectory: res.data.length > 0 ? [res.data[0].key] : [],
          },
        });
      }
    },

    *listTestcase({ payload }: Payload, { call, put, select }: any) {
      const res: any = yield call(listTestcase, payload);
      if (auth.response(res)) {
        const { pagination }: { pagination: State['pagination'] } = yield select(
          (state: any) => state.testcase,
        );
        yield put({
          type: 'save',
          payload: {
            testcases: res.data,
            pagination: { ...pagination, total: res.data.length, current: 1 },
          },
        });
      }
    },

    *queryTestcaseDirectory({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(queryTestcaseDirectory, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            directoryName: res.data.name,
            casePermission: true,
          },
        });
      }
    },

    *insertTestcaseDirectory({ payload }: Payload, { call }: any) {
      const res: any = yield call(insertTestcaseDirectory, payload);
      return auth.response(res, true);
    },

    *updateTestcaseDirectory({ payload }: Payload, { call }: any) {
      const res: any = yield call(updateTestcaseDirectory, payload);
      return auth.response(res, true);
    },

    *moveTestCaseToDirectory({ payload }: Payload, { call }: any) {
      const res: any = yield call(moveTestCase, payload);
      return auth.response(res, true);
    },

    *deleteTestcaseDirectory({ payload }: Payload, { call }: any) {
      const res: any = yield call(deleteTestcaseDirectory, payload);
      return auth.response(res, true);
    },

    *deleteTestcase({ payload }: Payload, { call }: any) {
      const res: any = yield call(deleteTestcase, payload);
      return auth.response(res, true);
    },

    *queryTestcase({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(queryTestCase, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            caseInfo: res.data.case,
            asserts: res.data.asserts,
            preConstructor: res.data.constructors
              .filter((v: any) => v.suffix === false)
              .map((v: any, index: number) => ({ ...v, index })),
            postConstructor: res.data.constructors
              .filter((v: any) => v.suffix === true)
              .map((v: any, index: number) => ({ ...v, index })),
            constructors_case: res.data.constructors_case,
            testData: res.data.test_data,
            outParameters: [
              ...res.data.out_parameters.map((item: any, index: number) => ({
                ...item,
                key: index,
              })),
              {
                key: res.data.out_parameters.length,
                source: 0,
              },
            ],
          },
        });
      }
    },

    *insertTestcase({ payload }: Payload, { call }: any) {
      const res: any = yield call(createTestCase, payload);
      if (auth.response(res, true)) {
        const caseId = res.data;
        window.location.href = `/#/apiTest/testcase/${payload.directory_id}/${caseId}`;
      }
    },

    *createTestCase({ payload }: Payload, { call }: any) {
      const res: any = yield call(createTestCaseV2, payload);
      return auth.response(res, true);
    },

    *updateTestcase({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(updateTestCase, payload);
      if (auth.response(res, true)) {
        yield put({
          type: 'save',
          payload: {
            caseInfo: res.data.case_info,
            outParameters: [
              ...res.data.out_parameters.map((item: any, index: number) => ({
                ...item,
                key: index,
              })),
              {
                key: res.data.out_parameters.length,
                source: 0,
              },
            ],
            editing: false,
          },
        });
      }
    },
    *executeTestcase({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(executeCase, payload);
      if (auth.response(res, true)) {
        yield put({
          type: 'save',
          payload: {
            testResult: res.data,
          },
        });
        return true;
      }
      return false;
    },

    *executeSelectedCase({ payload }: Payload, { call }: any) {
      return yield call(executeSelectedCase, payload);
    },

    *insertTestCaseAsserts({ payload }: Payload, { call }: any) {
      return yield call(insertTestCaseAsserts, payload);
    },
    *updateTestCaseAsserts({ payload }: Payload, { call }: any) {
      return yield call(updateTestCaseAsserts, payload);
    },
    *deleteTestCaseAsserts({ payload }: Payload, { call }: any) {
      const res: any = yield call(deleteTestCaseAsserts, payload);
      return auth.response(res, true);
    },

    *onExecuteTestCase({ payload }: Payload, { call }: any) {
      return yield call(executeCase, payload);
    },

    *insertTestcaseData({ payload }: Payload, { call, put, select }: any) {
      const { testData }: { testData: any } = yield select((state: any) => state.testcase);
      const { env } = payload;
      const res: any = yield call(insertTestcaseData, payload);
      if (auth.response(res, true)) {
        const newData = { ...testData };
        if (newData[parseInt(env, 10)] === undefined) {
          newData[parseInt(env, 10)] = [res.data];
        } else {
          newData[parseInt(env, 10)].push(res.data);
        }
        yield put({
          type: 'save',
          payload: { testData: newData },
        });
        return true;
      }
      return false;
    },

    *updateTestcaseData({ payload }: Payload, { call, put, select }: any) {
      const { testData }: { testData: any } = yield select((state: any) => state.testcase);
      const { env } = payload;
      const res: any = yield call(updateTestcaseData, payload);
      if (auth.response(res, true)) {
        const newData = { ...testData };
        const temp = newData[parseInt(env, 10)];
        const index = temp.findIndex((item: any) => res.data.id === item.id);
        const item = temp[index];
        temp.splice(index, 1, { ...item, ...res.data });
        yield put({
          type: 'save',
          payload: { testData: newData },
        });
        return true;
      }
      return false;
    },

    *deleteTestcaseData({ payload }: Payload, { call }: any) {
      const res: any = yield call(deleteTestcaseData, payload);
      return auth.response(res, true);
    },

    *retryCase({ payload }: Payload, { call }: any) {
      const res: any = yield call(retryCase, payload);
      if (auth.response(res, true)) {
        return res.data;
      }
    },

    *onlinePyScript({ payload }: Payload, { call }: any) {
      const res: any = yield call(onlinePyScript, payload);
      if (auth.response(res, false)) {
        return res.data;
      }
      return 'None';
    },
  },
};
