// @ts-nocheck
import {
  deleteUsers,
  listUserActivities,
  listUserOperationLog,
  listUsers,
  loginGithub,
  queryFollowTestPlanData,
  queryUserStatistics,
  updateAvatar,
  updateUsers,
} from '@/services/user';
import auth from '@/utils/auth';
import { getPageQuery } from '@/utils/utils';
import { message } from 'antd';
import { stringify } from 'querystring';
import { history } from 'umi';

interface Payload {
  payload?: any;
}

interface State {
  currentUser: any;
  userList: any[];
  currentUserList: any[];
  userMap: any;
  userNameMap: any;
  activities: any[];
  operationLog: any[];
  project_count: number;
  case_count: number;
  user_rank: number;
  total_user: number;
  weekly_case: any[];
  followPlan: any[];
}

const getUserMap = (data: any[]) => {
  const temp: Record<number, any> = {};
  const userNameMap: Record<number, string> = {};
  data.forEach((item) => {
    temp[item.id] = item;
    userNameMap[item.id] = item.name;
  });
  return { userMap: temp, userNameMap };
};

const UserModel = {
  namespace: 'user',
  state: {
    currentUser: {},
    userList: [],
    currentUserList: [],
    userMap: {},
    userNameMap: {},
    activities: [],
    operationLog: [],
    project_count: 0,
    case_count: 0,
    user_rank: 0,
    total_user: 0,
    weekly_case: [],
    followPlan: [],
  } as State,
  effects: {
    *fetchUserActivities({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(listUserActivities, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            activities: res.data,
          },
        });
      }
    },

    *fetchUserRecord({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(listUserOperationLog, payload);
      if (auth.response(res)) {
        yield put({
          type: 'save',
          payload: {
            operationLog: res.data,
          },
        });
      }
    },

    *updateUser({ payload }: Payload, { call }: any) {
      const response: any = yield call(updateUsers, payload);
      return auth.response(response, true);
    },

    *deleteUser({ payload }: Payload, { call }: any) {
      const response: any = yield call(deleteUsers, payload);
      return auth.response(response, true);
    },

    *fetchUserList(_: any, { call, put }: any) {
      const response: any = yield call(listUsers);
      const { userMap, userNameMap } = getUserMap(response);
      yield put({
        type: 'save',
        payload: {
          userList: response,
          currentUserList: response,
          userMap,
          userNameMap,
        },
      });
    },

    *getGithubToken({ payload }: Payload, { call, put }: any) {
      const response: any = yield call(loginGithub, payload);
      if (response.code === 0) {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        message.success('🎉 🎉 🎉  登录成功！');
        yield put({
          type: 'login/changeLoginStatus',
          payload: response,
        });
        yield put({
          type: 'fetchCurrent',
        });
        let { redirect } = params;

        if (redirect) {
          const redirectUrlParams = new URL(redirect);

          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);

            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }

        history.replace(redirect || '/');
      } else {
        message.error(response.msg);
      }
    },

    *avatar({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(updateAvatar, payload);
      if (auth.response(res, true)) {
        const pityUser = localStorage.getItem('pityUser');
        const info = JSON.parse(pityUser || '{}');
        info.avatar = res.data;
        localStorage.setItem('pityUser', JSON.stringify(info));
        yield put({
          type: 'saveCurrentUser',
          payload: info,
        });
      }
    },

    *queryUserStatistics(_: any, { call, put }: any) {
      const response: any = yield call(queryUserStatistics);
      if (auth.response(response)) {
        yield put({
          type: 'save',
          payload: {
            project_count: response.data.project_count,
            case_count: response.data.case_count,
            user_rank: response.data.user_rank,
            total_user: response.data.total_user,
            weekly_case: response.data.weekly_case,
          },
        });
      }
    },

    *queryFollowTestPlanData(_: any, { call, put }: any) {
      const response: any = yield call(queryFollowTestPlanData);
      if (auth.response(response)) {
        yield put({
          type: 'save',
          payload: {
            followPlan: response.data,
          },
        });
      }
    },

    *fetchCurrent(_: any, { put }: any) {
      const token = localStorage.getItem('pityToken');
      const userInfo = localStorage.getItem('pityUser');
      const pityExpire = localStorage.getItem('pityExpire');
      if (!token || !userInfo || new Date().getTime() / 1000 > Number(pityExpire)) {
        message.info('登录信息已失效');
        localStorage.removeItem('pityToken');
        localStorage.removeItem('pityUser');
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
        return;
      }
      const info = JSON.parse(userInfo);
      yield put({
        type: 'saveCurrentUser',
        payload: info,
      });
    },
  },
  reducers: {
    save(state: State, { payload }: Payload) {
      return { ...state, ...payload };
    },

    saveCurrentUser(state: State, action: any) {
      localStorage.setItem('pityUser', JSON.stringify(action.payload || {}));
      return { ...state, currentUser: action.payload || {} };
    },

    changeNotifyCount(
      state: State = {
        currentUser: {},
      } as State,
      action: any,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
export default UserModel;
