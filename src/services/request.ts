import CONFIG from '@/consts/config';
import auth from '@/utils/auth';
import request from '@/utils/request';

interface RequestParams {
  [key: string]: any;
}

export async function httpRequest(params: RequestParams) {
  return request(`${CONFIG.URL}/request/http`, {
    method: 'POST',
    data: params,
    headers: auth.headers(),
  });
}

export async function executeCase(params: RequestParams) {
  return request(`${CONFIG.URL}/request/run`, {
    method: 'GET',
    params,
    headers: auth.headers(),
  });
}

export async function executeSelectedCase(params: { case_list: any[]; env: any }) {
  return request(`${CONFIG.URL}/request/run/multiple`, {
    method: 'POST',
    data: params.case_list,
    params: { env: params.env },
    headers: auth.headers(),
  });
}
