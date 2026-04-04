// @ts-nocheck
import { fetchDatabaseSource, fetchTables, listHistory, onlineExecuteSQL } from '@/services/online';
import auth from '@/utils/auth';

interface Payload {
  payload?: any;
}

interface State {
  databaseSource: any[];
  table_map: Record<string, any>;
  tables: any[];
  currentDatabase: any;
  currentDatabaseTitle: string;
  currentDatabaseSqlType: number;
  testResults: any[];
  sqlColumns: any[];
  historyPage: {
    current: number;
    pageSize: number;
    showTotal: (total: number) => string;
    total: number;
  };
  historyData: any[];
}

export default {
  namespace: 'online',
  state: {
    databaseSource: [],
    table_map: {},
    tables: [],
    currentDatabase: null,
    currentDatabaseTitle: '',
    currentDatabaseSqlType: 0,
    testResults: [],
    sqlColumns: [],

    historyPage: {
      current: 1,
      pageSize: 4,
      showTotal: (total: number) => `共${total}条历史数据`,
      total: 0,
    },
    historyData: [],
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
    *fetchDatabaseSource(_: Payload, { call, put }: any) {
      const res: any = yield call(fetchDatabaseSource);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            databaseSource: res.data,
          },
        });
        return res.data;
      }
    },

    *fetchTables({ payload }: Payload, { call, put, select }: any) {
      const res: any = yield call(fetchTables, payload);
      if (auth.response(res)) {
        const online = yield select((state: any) => state.online);
        yield put({
          type: 'save',
          payload: {
            table_map: {
              ...online.table_map,
              [payload.id]: res.data.tables,
            },
            tables: res.data.tables,
            currentDatabase: payload.id,
          },
        });
        return res.data.children;
      }
    },

    *onlineExecuteSQL({ payload }: Payload, { call, put, select }: any) {
      const res: any = yield call(onlineExecuteSQL, payload);
      if (auth.response(res, true)) {
        yield put({
          type: 'save',
          payload: {
            sqlColumns: res.data.columns,
            testResults: res.data.result,
          },
        });
        const online = yield select((state: any) => state.online);
        yield put({
          type: 'fetchHistorySQL',
          payload: {
            page: online.historyPage.current,
            size: online.historyPage.pageSize,
          },
        });
      }
    },

    *fetchHistorySQL({ payload }: Payload, { call, put, select }: any) {
      const res: any = yield call(listHistory, payload);
      if (auth.response(res)) {
        const online = yield select((state: any) => state.online);
        yield put({
          type: 'save',
          payload: {
            historyData: res.data.data,
            historyPage: {
              ...online.historyPage,
              total: res.data.total,
            },
          },
        });
      }
    },
  },
};
