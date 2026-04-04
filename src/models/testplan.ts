// @ts-nocheck
import {
  deleteTestPlan,
  executeTestPlan,
  followTestPlan,
  insertTestPlan,
  listTestPlan,
  listTestPlanCaseTree,
  unFollowTestPlan,
  updateTestPlan,
} from '@/services/testplan';
import auth from '@/utils/auth';

interface Payload {
  payload?: any;
}

interface State {
  planData: any[];
  planRecord: any;
  planName: string;
  caseMap: any;
  visible: boolean;
  title: string;
  currentStep: number;
  treeData: any[];
  selectedCaseData: any[];
}

export default {
  namespace: 'testplan',
  state: {
    planData: [],
    planRecord: {},
    planName: '',
    caseMap: {},
    visible: false,
    title: '',
    currentStep: 0,
    treeData: [],
    selectedCaseData: [],
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
    *listTestPlan({ payload }: Payload, { call }: any) {
      const res: any = yield call(listTestPlan, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            planData: res.data,
          },
        });
      }
    },

    *insertTestPlan({ payload }: Payload, { call }: any) {
      const res: any = yield call(insertTestPlan, payload);
      return auth.response(res, true);
    },

    *updateTestPlan({ payload }: Payload, { call }: any) {
      const res: any = yield call(updateTestPlan, payload);
      return auth.response(res, true);
    },

    *deleteTestPlan({ payload }: Payload, { call }: any) {
      const res: any = yield call(deleteTestPlan, payload);
      return auth.response(res, true);
    },

    *executeTestPlan({ payload }: Payload, { call }: any) {
      const res: any = yield call(executeTestPlan, payload);
      return auth.response(res);
    },

    *followTestPlan({ payload }: Payload, { call }: any) {
      const res: any = yield call(followTestPlan, payload);
      return auth.response(res, true);
    },

    *unFollowTestPlan({ payload }: Payload, { call }: any) {
      const res: any = yield call(unFollowTestPlan, payload);
      return auth.response(res, true);
    },

    *listTestCaseTreeWithProjectId({ payload }: Payload, { call }: any) {
      const res: any = yield call(listTestPlanCaseTree, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            treeData: res.data.tree,
            caseMap: res.data.case_map,
          },
        });
      }
    },
  },
};
