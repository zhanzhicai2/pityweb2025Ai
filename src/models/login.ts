// @ts-nocheck
import { checkUrl, generateResetLink, login, register, resetPwd } from '@/services/login';
import auth from '@/utils/auth';
import { getPageQuery } from '@/utils/utils';
import { history } from '@umijs/max';
import { message, notification } from 'antd';
import { stringify } from 'querystring';

interface Payload {
  payload?: any;
}

interface State {
  status?: any;
  currentEmail: string;
}

const Model = {
  namespace: 'login',
  state: {
    status: undefined,
    currentEmail: '',
  } as State,
  effects: {
    *register({ payload }: Payload, { call }: any) {
      const response: any = yield call(register, {
        username: payload.username,
        password: payload.password,
        name: payload.name,
        email: payload.email,
      });
      if (response.code !== 0) {
        message.error(response.msg);
        return;
      }
      payload.setType('account');
      message.success(response.msg);
    },

    *login({ payload }: Payload, { call, put }: any) {
      const response: any = yield call(login, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      }); // Login successfully

      if (response.code === 0) {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        message.success('🎉 🎉 🎉  登录成功！');
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
        if (history !== undefined) {
          history.replace(redirect || '/');
        } else {
          window.location.href = '/';
        }
      } else {
        message.error(response.msg || '网络开小差了，请稍后重试');
      }
    },

    logout() {
      const { redirect } = getPageQuery();
      if (window.location.pathname !== '/#/user/login' && !redirect) {
        localStorage.removeItem('pityToken');
        localStorage.removeItem('pityUser');
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },

    *resetPwd({ payload }: Payload, { call }: any) {
      const res: any = yield call(generateResetLink, payload);
      if (auth.response(res)) {
        notification.success({
          message: `正在发送重置密码邮件`,
          description: `我们正在为${payload}发送重置密码邮件, 如果您已注册过pity，请注意查收邮件。`,
        });
      }
    },

    *doResetPassword({ payload }: Payload, { call }: any) {
      const res: any = yield call(resetPwd, payload);
      return auth.response(res);
    },

    *checkResetUrl({ payload }: Payload, { call, put }: any) {
      const res: any = yield call(checkUrl, payload);
      if (!auth.notificationResponse(res)) {
        return;
      }
      yield put({
        type: 'save',
        payload: {
          currentEmail: res.data,
        },
      });
    },
  },
  reducers: {
    save(state: State, { payload }: Payload) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
export default Model;
