// @ts-nocheck
import {
  generateCase,
  importFile,
  queryRecordStatus,
  removeRecord,
  startRecord,
  stopRecord,
} from '@/services/testcase';
import auth from '@/utils/auth';

interface Payload {
  payload?: any;
}

interface State {
  recordStatus: boolean;
  recordLists: any[];
  regex: string;
}

export default {
  namespace: 'recorder',
  state: {
    recordStatus: false,
    recordLists: [],
    regex: '',
  } as State,
  reducers: {
    save(state: State, { payload }: Payload) {
      return {
        ...state,
        ...payload,
      };
    },
    readRecord(state: State, { payload }: Payload) {
      return {
        ...state,
        recordLists: [
          ...state.recordLists,
          {
            ...payload.data,
            index: state.recordLists.length,
            cookies: JSON.stringify(payload.data.cookies, null, 2),
            response_headers: JSON.stringify(payload.data.response_headers, null, 2),
            request_headers: JSON.stringify(payload.data.request_headers, null, 2),
          },
        ],
      };
    },
  },
  effects: {
    *queryRecordStatus({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(queryRecordStatus, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            recordStatus: res.data.status,
            recordLists: res.data.data.map((v: any, idx: number) => ({
              ...v,
              index: idx,
              cookies: JSON.stringify(v.cookies, null, 2),
              request_cookies: JSON.stringify(v.request_cookies, null, 2),
              response_headers: JSON.stringify(v.response_headers, null, 2),
              request_headers: JSON.stringify(v.request_headers, null, 2),
            })),
            regex: res.data.regex,
          },
        });
      }
    },

    *startRecord({ payload }: Payload, { call, put }: any) {
      yield put({
        type: 'save',
        payload: {
          recordLists: [],
        },
      });
      const res: any = yield call(startRecord, payload);
      if (auth.response(res, true)) {
        yield put({
          type: 'save',
          payload: {
            recordStatus: true,
            recordLists: [],
          },
        });
      }
    },

    *stopRecord({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(stopRecord, payload);
      if (auth.response(res, true)) {
        yield put({
          type: 'save',
          payload: {
            recordStatus: false,
          },
        });
      }
    },

    *generateCase({ payload }: Payload, { call }: any) {
      const res: any = yield call(generateCase, payload);
      if (auth.response(res)) {
        return res;
      }
      return false;
    },

    *import({ payload }: Payload, { call }: any) {
      const res: any = yield call(importFile, payload);
      if (auth.response(res)) {
        return res.data.map((v: any, index: number) => ({
          ...v,
          index,
          request_headers: JSON.stringify(v.request_headers, null, 2),
          response_headers: JSON.stringify(v.response_headers, null, 2),
          cookies: JSON.stringify(v.cookies, null, 2),
          request_cookies: JSON.stringify(v.request_cookies, null, 2),
        }));
      }
      return [];
    },

    *remove({ payload }: Payload, { call, put, select }: any) {
      const recorder = yield select((state: any) => state.recorder);
      const res: any = yield call(removeRecord, payload);
      if (auth.response(res, true)) {
        const data = recorder.recordLists
          .filter((v: any, idx: number) => idx !== payload)
          .map((item: any, k: number) => ({
            ...item,
            index: k,
          }));
        yield put({
          type: 'save',
          payload: {
            recordLists: data,
          },
        });
      }
    },
  },
};
