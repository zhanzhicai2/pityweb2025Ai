import CONFIG from '@/consts/config';
import request from '@/utils/request';

interface LoginParams {
  [key: string]: any;
}

export async function fakeAccountLogin(params: LoginParams) {
  return request('/api/login/account', {
    method: 'POST',
    data: params,
  });
}

export async function login(params: LoginParams) {
  return request(`${CONFIG.URL}/auth/login`, {
    method: 'POST',
    data: params,
  });
}

export async function generateResetLink(params: string) {
  return request(`${CONFIG.URL}/auth/reset/generate/${params}`, {
    method: 'GET',
  });
}

export async function checkUrl(params: string) {
  return request(`${CONFIG.URL}/auth/reset/check/${params}`, {
    method: 'GET',
  });
}

// 重置密码接口
export async function resetPwd(data: LoginParams) {
  return request(`${CONFIG.URL}/auth/reset`, {
    method: 'POST',
    data,
  });
}

// 注册接口
export async function register(params: LoginParams) {
  return request(`${CONFIG.URL}/auth/register`, {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}
