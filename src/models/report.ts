// @ts-nocheck
import { listTestReport } from '@/services/report';
import auth from '@/utils/auth';

interface Payload {
  payload?: any;
}

interface State {
  reportData: any[];
  pagination: {
    pageSize: number;
    current: number;
    total: number;
    showTotal: (total: number) => string;
  };
}

export default {
  namespace: 'report',
  state: {
    reportData: [],
    pagination: {
      pageSize: 8,
      current: 1,
      total: 0,
      showTotal: (total: number) => `共${total}条记录`,
    },
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
    *fetchReportList({ payload }: Payload, { call, put, select }: any) {
      const { pagination }: { pagination: State['pagination'] } = yield select(
        (state: any) => state.report,
      );
      const res: any = yield call(listTestReport, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            reportData: res.data,
            pagination: {
              ...pagination,
              total: res.total,
            },
          },
        });
      }
    },
  },
};
